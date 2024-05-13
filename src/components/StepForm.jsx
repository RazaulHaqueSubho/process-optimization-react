/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"

function StepForm({
  step,
  machineCapabilities,
  updateStep,
  deleteStep,
  addStep,
}) {
  const [selectionPath, setSelectionPath] = useState([])
  const [currentData, setCurrentData] = useState(machineCapabilities)
  const [editStates, setEditStates] = useState({})
  const [localParameters, setLocalParameters] = useState({})
  const [selectedOptions, setSelectedOptions] = useState({})
  const [isNewStep, setIsNewStep] = useState(true)
  const [inputData, setInputData] = useState({})
  const [displayValues, setDisplayValues] = useState({})
  const [newData, setNewData] = useState({})
  const [lastId, setLastId] = useState(0)

  useEffect(() => {
    if (isNewStep) {
      setLocalParameters({})
      setInputData({})
    } else {
      setLocalParameters(step.Parameters || {})
      setInputData(step.Parameters || {})
    }
  }, [step, isNewStep])

  useEffect(() => {
    if (isNewStep) {
      setSelectionPath([])
      setCurrentData(machineCapabilities)
      setLocalParameters({})
      setEditStates({})
    } else {
      const path = step.ExecuteFunction ? step.ExecuteFunction.split("/") : []
      setSelectionPath(path)
      const initialData = resolveValuesFromPath(path, machineCapabilities)
      setCurrentData(initialData)
      setLocalParameters(step.Parameters || {})
    }
  }, [machineCapabilities, step, isNewStep])

  useEffect(() => {
    if (isNewStep) {
      setLocalParameters({})
    } else {
      setLocalParameters(step.Parameters || {})
    }
  }, [step, isNewStep])

  const resolveValuesFromPath = (pathArray, data) => {
    return pathArray.reduce((acc, key) => acc && acc[key], data)
  }

  const renderDropdowns = (data, level) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return null
    }

    const keys = Object.keys(data).filter(
      (key) => typeof data[key] === "object" && data[key] !== null
    )
    if (keys.length === 0) {
      if (!selectionPath[level]) {
        return renderInputs(data, level)
      }
      return null
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          width: "100%",
        }}
        className='flex justify-center'
      >
        <select
          key={level}
          value={selectionPath[level] || ""}
          onChange={(e) => handleDropdownChange(e, level)}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          style={{ marginBottom: "10px", flex: "1 1 0%", maxWidth: "200px" }}
        >
          <option value=''>Select...</option>
          {keys.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const renderInputs = (data, level) => {
    const inputData = { ...data, ...localParameters }

    return Object.entries(inputData).map(([key, value]) => {
      const isEditing = editStates[key]
      const displayValue = displayValues.hasOwnProperty(key)
        ? displayValues[key]
        : value

      return (
        <div
          key={`${level}-${key}`}
          className='mb-2 flex justify-between items-center'
        >
          <label>{key}:</label>
          {isEditing ? (
            <input
              type='text'
              value={displayValue}
              onChange={(e) => {
                const newValue = e.target.value
                setLocalParameters((prevParameters) => {
                  const updatedParameters = {
                    ...prevParameters,
                    [key]: newValue,
                  }
                  return updatedParameters
                })
                setDisplayValues((prevValues) => ({
                  ...prevValues,
                  [key]: newValue,
                }))
              }}
              className='flex-1 mx-2 p-1 border rounded'
            />
          ) : (
            <span className='flex-1 mx-2 p-1 border rounded'>
              {displayValue}
            </span>
          )}
          <button
            onClick={() => setEditStates({ ...editStates, [key]: !isEditing })}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            onClick={() => {
              const newParams = { ...localParameters }
              delete newParams[key]
              setLocalParameters(newParams)
              const newEditStates = { ...editStates }
              delete newEditStates[key]
              setEditStates(newEditStates)
            }}
            className='ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded'
          >
            Delete
          </button>
        </div>
      )
    })
  }

  useEffect(() => {
    setDisplayValues(localParameters)
  }, [localParameters])

  const handleDropdownChange = (e, level) => {
    const nextValue = e.target.value
    const newPath = [...selectionPath.slice(0, level), nextValue]
    setSelectionPath(newPath)
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [level]: nextValue,
    }))
  }

  const handleSaveStep = () => {
    let updatedStep
    if (isNewStep) {
      {
        renderDropdowns(currentData, 0)
      }
      const parameters = selectionPath.reduce(
        (acc, cur, idx) => [
          ...acc,
          renderDropdowns(
            resolveValuesFromPath(
              selectionPath.slice(0, idx + 1),
              machineCapabilities
            ),
            idx + 1
          ),
        ],
        []
      )
      updatedStep = {
        StepId: selectedOptions[0],
        ExecuteFunction: selectedOptions[2],
        StepType: step.StepType ? step.StepType : setLastId(lastId + 1),
        Transitions: [
          { hrFunction: isNewStep ? "success" : "failed", NextStepId: "" },
        ],
        Parameter: { ...parameters },
      }
      updateStep(step.StepId, updatedStep)
      setIsNewStep(false)
    }
    addStep(updatedStep)
  }

  const handleAddField = () => {
    const newFieldKey = `newField_${Object.keys(localParameters).length + 1}`
    setLocalParameters((prevParameters) => {
      const updatedParameters = { ...prevParameters, [newFieldKey]: "" }
      return updatedParameters
    })
    setInputData((prevData) => ({ ...prevData, [newFieldKey]: "" }))
  }
  return (
    <div className='mb-4 justify-center p-4 border rounded shadow-sm'>
      <h4 className='text-lg font-bold text-center'>Step: {step.StepId}</h4>
      {renderDropdowns(currentData, 0)}
      {selectionPath.reduce(
        (acc, cur, idx) => [
          ...acc,
          renderDropdowns(
            resolveValuesFromPath(
              selectionPath.slice(0, idx + 1),
              machineCapabilities
            ),
            idx + 1
          ),
        ],
        []
      )}
      <div className='mt-2 flex justify-center'>
        <button
          onClick={handleAddField}
          className='mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Add Field
        </button>
        <button
          onClick={() => handleSaveStep(currentData)}
          className='mt-2 mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
          disabled={
            !selectionPath.length || Object.keys(localParameters).length === 0
          }
        >
          Add Step
        </button>
        <button
          onClick={() => deleteStep(step.StepId)}
          className='mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
        >
          Delete Step
        </button>
      </div>
    </div>
  )
}

export default StepForm
