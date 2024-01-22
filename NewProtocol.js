import React, { useState } from "react";
import api from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Cookies from "js-cookie";

import SelectedCompany from "../../components/ProtocolsWater/SelectedCompany";
import MeasurementWater from "../../measurement/MeasurementWater";
import MeasurementGas from "../../measurement/MeasurementGas";
import MeasurementNull from "../../measurement/MeasurementNull";

const NewProtocol = () => {
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [measurementId, setMeasurementId] = useState(null);

  /*-----Комплект СИ--------- */
  const [selectedComplectId, setSelectedComplectId] = useState(null);
  const [selectedComplect, setSelectedComplect] = useState("Выберите комплект");
  const [selectedCompanyName, setSelectedCompanyName] =
    useState("Выберите компанию");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  /*-----Счетчик------ */
  const [selectedWater, setSelectedWater] = useState("");
  const [selectedRegistryId, setSelectedRegistryId] = useState("");
  const [selectedRegistryHot, setSelectedRegistryHot] = useState("");
  const [selectedRegistryCold, setSelectedRegistryCold] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedYear, setSelectedYear] = useState("Выберите год выпуска");
  const [meterFactoryNumber, setMeterFactoryNumber] = useState("");

  /*-----Метрологические хар-ки----*/
  const [diameter, setDiameter] = useState("");
  const [meterTemperature, setMeterTemperature] = useState("");
  const [minConsumption, setMinConsumption] = useState("");
  const [midConsumption, setMidConsumption] = useState("");
  const [maxConsumption, setMaxConsumption] = useState("");
  const [maxConsumptionActual, setMaxConsumptionActual] = useState("");
  const [toleranceLimitsMin, setToleranceLimitsMin] = useState("");
  const [toleranceLimitsMax, setToleranceLimitsMax] = useState("");
  const [pressureLoseMin, setPressureLoseMin] = useState("");
  const [pressureLoseMax, setPressureLoseMax] = useState("");

  /*-----Имя/Адрес------ */
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  /*-----Indication without optical------ */
  const [opticalSensor, setOpticalSensor] = useState("");
  const [colorResult, setColorResult] = useState([]);
  const [indicationData, setIndicationData] = useState({});
  const [indicationsData, setIndicationsData] = useState(null);

  const getIndicationsData = () =>
    Array.from({ length: 3 }, (_, index) => {
      const offset = index * 3;
      return {
        start_1: parseFloat(indicationsData[offset].start_1),
        start_2: parseFloat(indicationsData[offset + 1].start_1),
        start_3: parseFloat(indicationsData[offset + 2].start_1),
        finish_1: parseFloat(indicationsData[offset].finish_1),
        finish_2: parseFloat(indicationsData[offset + 1].finish_1),
        finish_3: parseFloat(indicationsData[offset + 2].finish_1),
        v_y_i_1: parseFloat(indicationsData[offset].v_y_i_1),
        v_y_i_2: parseFloat(indicationsData[offset + 1].v_y_i_1),
        v_y_i_3: parseFloat(indicationsData[offset + 2].v_y_i_1),
        q_i_1: parseFloat(indicationsData[offset].q_i_1),
        q_i_2: parseFloat(indicationsData[offset + 1].q_i_1),
        q_i_3: parseFloat(indicationsData[offset + 2].q_i_1),
      };
    });

  /*-----Indication with optical------ */
  const [state, setState] = useState({
    coefficient: "",
    impulse: "",
    impulse1: "",
    impulse2: "",
    waterVolume: "",
    waterVolume1: "",
    waterVolume2: "",
    qiOpticalMin: "",
    qiOpticalMid: "",
    qiOpticalMax: "",
    blockOptical1: false,
    blockOptical2: false,
    blockOptical3: false,
  });

  const getOpticalSensorData = () => [
    {
      conversion_factor: parseFloat(state.coefficient),
      v_y_i: parseFloat(state.waterVolume),
      impulses: parseFloat(state.impulse),
      q_i: parseFloat(state.qiOpticalMin),
    },
    {
      conversion_factor: parseFloat(state.coefficient),
      v_y_i: parseFloat(state.waterVolume1),
      impulses: parseFloat(state.impulse1),
      q_i: parseFloat(state.qiOpticalMid),
    },
    {
      conversion_factor: parseFloat(state.coefficient),
      v_y_i: parseFloat(state.waterVolume2),
      impulses: parseFloat(state.impulse2),
      q_i: parseFloat(state.qiOpticalMax),
    },
  ];

  /*----Indications Gas-------*/
  const [blockColorGasArray, setBlockColorGasArray] = useState(null);
  const [indicationGeneral, setIndicationGeneral] = useState({});
  const [indicationExtra, setIndicationExtra] = useState({});

  /*---------Внешний осмотр----- */
  const [isOut, setIsOut] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  /*-----CheckMarks------ */
  const [markPassport, setMarkPassport] = useState(false);
  const [markSi, setMarkSi] = useState(false);

  /*-----Заключение------ */
  const [areBothChecked, setAreBothChecked] = useState(false); // Заключение without optical
  const [conclusion, setConclusion] = useState(false); //Заключение with optical
  let totalAccept = false;
  if (opticalSensor === true) {
    totalAccept = conclusion;
  } else if (opticalSensor === false) {
    totalAccept = areBothChecked;
  }

  /*-----ЗаключениеГаз------ */
  const [areBothCheckedGas, setAreBothCheckedGas] = useState(false);

  /*-----conditions------ */
  const [examinationData, setExaminationData] = useState({});
  const commonConditionValues = {
    air_temp: parseFloat(examinationData.air_temp),
    humidity: parseFloat(examinationData.humidity),
    pressure: parseFloat(examinationData.pressure),
  };
  const conditions = [
    {
      ...commonConditionValues,
      water_temp: parseFloat(examinationData.water_temp1),
    },
    {
      ...commonConditionValues,
      water_temp: parseFloat(examinationData.water_temp2),
    },
  ];

  const [examinationDataGas, setExaminationDataGas] = useState({});
  const commonConditionValuesGas = {
    air_temp: parseFloat(examinationDataGas.air_temp),
    humidity: parseFloat(examinationDataGas.humidity),
    pressure: parseFloat(examinationDataGas.pressure),
    nutrition: parseFloat(examinationDataGas.nutrition),
    current: parseFloat(examinationDataGas.current),
    air_difference: parseFloat(examinationDataGas.air_difference),
    temperature_changes: parseFloat(examinationDataGas.temperatureChanges),
  };
  const conditionsGas = [
    {
      ...commonConditionValuesGas,
      air_difference: parseFloat(examinationDataGas.air_differenceStart),
      temperature_changes: parseFloat(
        examinationDataGas.temperatureChangesStart
      ),
    },
    {
      ...commonConditionValuesGas,
      air_difference: parseFloat(examinationDataGas.air_differenceStart),
      temperature_changes: parseFloat(
        examinationDataGas.temperatureChangesFinish
      ),
    },
  ];

  /*-----Дата поверки/дата следующей поверки------ */
  const [verificationDate, setVerificationDate] = useState(new Date());
  const [nextVerificationDate, setNextVerificationDate] = useState(null);

  const verificationDateFormatted = verificationDate
    ? format(verificationDate, "yyyy-MM-dd HH:mm:ss")
    : null;

  const nextVerificationDateFormatted = nextVerificationDate
    ? format(nextVerificationDate, "yyyy-MM-dd HH:mm:ss")
    : null;

  /*-----POST---- */
  const handleSaveProtocol = async () => {
    if (!isButtonEnabled) {
      return;
    }
    setIsButtonEnabled(false);
    try {
      const token = Cookies.get("accessToken");
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/protocols`;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      };

      let measurementData = {};

      if (measurementId === 1) {
        measurementData = {
          indications: opticalSensor
            ? getOpticalSensorData()
            : getIndicationsData(),
          meter_type: selectedWater,
          conditions: conditions,
          diameter: parseFloat(diameter),
          total_accepted: totalAccept,
        };
      } else if (measurementId === 5) {
        measurementData = {
          pressure_lose_min: parseFloat(pressureLoseMin),
          pressure_lose_max: parseFloat(pressureLoseMax),
          meter_temperature: parseFloat(meterTemperature),
          conditions: conditionsGas,
          total_accepted: areBothCheckedGas,
        };
      }

      const data = {
        case_id: selectedComplectId,
        meter_id: selectedRegistryId,
        meter_factory_number: meterFactoryNumber,
        meter_factory_year: selectedYear,
        customer_name: customerName,
        customer_address: customerAddress,
        mechanical_accepted: isOut,
        tightness_accepted: isTesting,
        mark_passport: markPassport,
        mark_si: markSi,
        accepted_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        q_t: parseFloat(midConsumption),
        q_min: parseFloat(minConsumption),
        q_max: parseFloat(maxConsumption),
        q_actual: parseFloat(maxConsumptionActual),
        q_min_limit: parseFloat(toleranceLimitsMin),
        q_max_limit: parseFloat(toleranceLimitsMax),
        verification_date: verificationDateFormatted,
        next_verification_date: nextVerificationDateFormatted,
        ...measurementData,
      };

      const request = {
        url: apiUrl,
        method: "POST",
        payload: data,
        headers: headers,
      };

      if ("serviceWorker" in navigator && "SyncManager" in window) {
        if (!navigator.onLine) {
          navigator.serviceWorker.controller.postMessage({
            form_data: request,
          });
          navigator.serviceWorker.ready.then(function (registration) {
            return registration.sync.register("sendFormData");
          });
          alert(
            "Протокол успешно создан. Данные будут отправлены на сервер, когда интернет появится."
          );
          navigate("/metriva/protocols");
        } else {
          const response = await api.post(apiUrl, data, { headers });
          alert("Протокол успешно создан.");
          navigate("/metriva/protocols");
        }
      } else {
        const response = await api.post(apiUrl, data, { headers });
        alert("Протокол успешно создан.");
        navigate("/metriva/protocols");
      }
    } catch (error) {
      setIsButtonEnabled(true);
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = error.response.data.errors;
        setValidationErrors(serverErrors);
      } else {
        setValidationErrors({
          generic: "Произошла ошибка при сохранении протакола.",
        });
      }
    }
  };

  return (
    <main className="main">
      <div className="create_edit_read">
        <SelectedCompany
          selectedComplect={selectedComplect}
          setSelectedComplect={setSelectedComplect}
          setSelectedComplectId={setSelectedComplectId}
          selectedCompanyName={selectedCompanyName}
          setSelectedCompanyName={setSelectedCompanyName}
          selectedCompanyId={selectedCompanyId}
          setSelectedCompanyId={setSelectedCompanyId}
          setMeasurementId={setMeasurementId}
          setOpticalSensor={setOpticalSensor}
          validationErrors={validationErrors}
        />

        {measurementId === null && <MeasurementNull />}

        {measurementId === 1 && (
          <MeasurementWater
            setSelectedWater={setSelectedWater}
            selectedWater={selectedWater}
            meterFactoryNumber={meterFactoryNumber}
            setMeterFactoryNumber={setMeterFactoryNumber}
            setSelectedRegistryId={setSelectedRegistryId}
            selectedRegistryHot={selectedRegistryHot}
            selectedRegistryCold={selectedRegistryCold}
            setSelectedRegistryHot={setSelectedRegistryHot}
            setSelectedRegistryCold={setSelectedRegistryCold}
            inputValue={inputValue}
            setInputValue={setInputValue}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            diameter={diameter}
            setDiameter={setDiameter}
            minConsumption={minConsumption}
            setMinConsumption={setMinConsumption}
            midConsumption={midConsumption}
            setMidConsumption={setMidConsumption}
            maxConsumption={maxConsumption}
            setMaxConsumption={setMaxConsumption}
            maxConsumptionActual={maxConsumptionActual}
            setMaxConsumptionActual={setMaxConsumptionActual}
            toleranceLimitsMin={toleranceLimitsMin}
            setToleranceLimitsMin={setToleranceLimitsMin}
            toleranceLimitsMax={toleranceLimitsMax}
            setToleranceLimitsMax={setToleranceLimitsMax}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            isOut={isOut}
            isTesting={isTesting}
            setIsOut={setIsOut}
            setIsTesting={setIsTesting}
            state={state}
            setState={setState}
            setExaminationData={setExaminationData}
            setColorResult={setColorResult}
            setIndicationsData={setIndicationsData}
            indicationData={indicationData}
            conclusion={conclusion}
            setConclusion={setConclusion}
            blockOptical1={state.blockOptical1}
            blockOptical2={state.blockOptical2}
            blockOptical3={state.blockOptical3}
            areBothChecked={areBothChecked}
            setAreBothChecked={setAreBothChecked}
            colorResult={colorResult}
            markPassport={markPassport}
            markSi={markSi}
            setMarkPassport={setMarkPassport}
            setMarkSi={setMarkSi}
            verificationDate={verificationDate}
            setVerificationDate={setVerificationDate}
            nextVerificationDate={nextVerificationDate}
            setNextVerificationDate={setNextVerificationDate}
            opticalSensor={opticalSensor}
            validationErrors={validationErrors}
          />
        )}

        {measurementId === 5 && (
          <MeasurementGas
            meterFactoryNumber={meterFactoryNumber}
            setMeterFactoryNumber={setMeterFactoryNumber}
            setSelectedRegistryId={setSelectedRegistryId}
            inputValue={inputValue}
            setInputValue={setInputValue}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            meterTemperature={meterTemperature}
            setMeterTemperature={setMeterTemperature}
            minConsumption={minConsumption}
            setMinConsumption={setMinConsumption}
            midConsumption={midConsumption}
            setMidConsumption={setMidConsumption}
            maxConsumption={maxConsumption}
            setMaxConsumption={setMaxConsumption}
            toleranceLimitsMin={toleranceLimitsMin}
            setToleranceLimitsMin={setToleranceLimitsMin}
            toleranceLimitsMax={toleranceLimitsMax}
            pressureLoseMin={pressureLoseMin}
            setPressureLoseMin={setPressureLoseMin}
            pressureLoseMax={pressureLoseMax}
            setPressureLoseMax={setPressureLoseMax}
            setToleranceLimitsMax={setToleranceLimitsMax}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            isOut={isOut}
            isTesting={isTesting}
            setIsOut={setIsOut}
            setIsTesting={setIsTesting}
            setIndicationGeneral={setIndicationGeneral}
            setIndicationExtra={setIndicationExtra}
            blockColorGasArray={blockColorGasArray}
            setBlockColorGasArray={setBlockColorGasArray}
            setExaminationDataGas={setExaminationDataGas}
            areBothCheckedGas={areBothCheckedGas}
            setAreBothCheckedGas={setAreBothCheckedGas}
            markPassport={markPassport}
            markSi={markSi}
            setMarkPassport={setMarkPassport}
            setMarkSi={setMarkSi}
            verificationDate={verificationDate}
            setVerificationDate={setVerificationDate}
            nextVerificationDate={nextVerificationDate}
            setNextVerificationDate={setNextVerificationDate}
            validationErrors={validationErrors}
          />
        )}

        {measurementId != null && (
          <button
            className={`save_button ${!isButtonEnabled ? "disabled" : ""}`}
            onClick={handleSaveProtocol}
            disabled={!isButtonEnabled}
          >
            Сохранить
          </button>
        )}
      </div>
    </main>
  );
};

export default NewProtocol;
