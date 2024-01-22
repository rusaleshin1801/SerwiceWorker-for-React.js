const CACHE_NAME = "s-app-v3";
const DYNAMIC_CACHE_NAME = "d-app-v3";

const cacheFiles = [
  "/static/js/main.js",
  "/static/css/main.css",
  "/manifest.json",
];

// IndexedDB
const FOLDER_NAME = "s3-request";
const DB_NAME = "requestDB";
let form_data;
let our_db;

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Opened cache");
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener("activate", async (event) => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name !== CACHE_NAME)
      .filter((name) => name !== DYNAMIC_CACHE_NAME)
      .map((name) => caches.delete(name))
  );
});

self.addEventListener("message", function (event) {
  if (event.data.hasOwnProperty("form_data")) {
    form_data = event.data.form_data;
    console.log("Получены данные из сообщения:", form_data);
  }
});

self.addEventListener("fetch", function (event) {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === "GET") {
    if (url.origin === location.origin) {
      event.respondWith(cacheFirst(event.request));
    } else {
      event.respondWith(networkFirst(request));
    }
  }

  if (form_data && form_data.url && form_data.method === "POST") {
    event.respondWith(
      fetch(event.request.clone()).catch(function () {
        savePostRequests(form_data.url, form_data.method, form_data);
        form_data = null;
      })
    );
  }
});

function getObjectStore(storeName, mode) {
  return our_db.transaction(storeName, mode).objectStore(storeName);
}

function savePostRequests(url, method, form_data) {
  const request = getObjectStore(FOLDER_NAME, "readwrite").add({
    url: url,
    method: method,
    payload: form_data.payload,
    headers: form_data.headers,
  });

  request.onsuccess = function () {
    console.log("Новый запрос добавлен в IndexedDB");
  };

  request.onerror = function (error) {
    console.error(error);
  };
}

function openDatabase() {
  var indexedDBOpenRequest = indexedDB.open("s3-request");

  indexedDBOpenRequest.onerror = function (error) {
    console.error("Ошибка IndexedDB:", error);
  };

  indexedDBOpenRequest.onupgradeneeded = function () {
    this.result.createObjectStore(FOLDER_NAME, {
      autoIncrement: true,
      keyPath: "id",
    });
  };

  indexedDBOpenRequest.onsuccess = function () {
    our_db = this.result;

    var transaction = our_db.transaction([FOLDER_NAME], "readonly");
    var objectStore = transaction.objectStore(FOLDER_NAME);

    objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (cursor) {
        console.log("Данные в IndexedDB:", cursor.value);
        cursor.continue();
      } else {
        console.log("Записей в IndexedDB больше нет.");
      }
    };
  };
}

openDatabase();

function sendPostToServer() {
  console.log("Отправка данных на сервер...");
  const savedRequests = [];
  const req = getObjectStore(FOLDER_NAME).openCursor();

  req.onsuccess = async function (event) {
    const cursor = event.target.result;

    if (cursor) {
      savedRequests.push(cursor.value);
      cursor.continue();
    } else {
      for (let savedRequest of savedRequests) {
        console.log("Сохраненный запрос", savedRequest);
        const requestUrl = savedRequest.url;
        const payload = savedRequest.payload;
        const method = savedRequest.method;
        const headers = savedRequest.headers;

        if (payload !== undefined) {
          console.log(
            "Отправка запроса на сервер:",
            requestUrl,
            method,
            headers
          );

          fetch(requestUrl, {
            method: method,
            body: JSON.stringify(payload),
            headers: headers,
          })
            .then(function (response) {
              console.log("Ответ сервера", response);
              if (response.status < 400) {
                getObjectStore(FOLDER_NAME, "readwrite").delete(
                  savedRequest.id
                );
              }
            })
            .catch(function (error) {
              console.error("Отправка на сервер не удалась:", error);
              throw error;
            });
        } else {
          console.error(
            "Payload равен undefined. Не удалось отправить запрос."
          );
        }
      }
    }
  };

  console.log("Завершена отправка данных на сервер.");
}

self.addEventListener("sync", function (event) {
  console.log("now online");
  if (event.tag === "sendFormData") {
    event.waitUntil(sendPostToServer());
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached ?? fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    return cached ?? (await caches.match("/offline.html"));
  }
}
