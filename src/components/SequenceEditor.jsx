/* eslint-disable react/prop-types */
import { useState } from "react"
import StepForm from "./StepForm"

function SequenceEditor({ machineCapabilities, sequence, setSequence }) {
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [currentStepFormParams, setCurrentStepFormParams] = useState({})
  const [stepData, setStepData] = useState(null)

  const addStep = (stepData) => {
    console.log(stepData, "StepData in SequenceEditor receibed")
    const newStep = {
      StepId: `${sequence.length + 1}`,
      ExecuteFunction: stepData.ExecuteFunction || "",
      Transitions: stepData.Transitions || [{ hrFunction: "", NextStepId: "" }],
      Parameter: stepData.Parameter || {},
    }
    setSequence([...sequence, newStep])
    setIsEditingExisting(false)
  }

  const handleStepData = (data) => {
    setStepData(data)
  }

  const updateStep = (StepId, updatedStep) => {
    const newSequence = sequence.map((step) =>
      step.StepId === StepId ? { ...step, ...updatedStep } : step
    )
    setSequence(newSequence)
  }

  const deleteStep = (StepId) => {
    setSequence(sequence.filter((step) => step.StepId !== StepId))
  }

  const generateSequence = () => {
    const filename = "sequence.json"
    const sequenceData = JSON.stringify(sequence, null, 2)

    const blob = new Blob([sequenceData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <h2 className='text-2xl text-center mt-2 font-semibold mb-4'>
        Sequence Editor
      </h2>
      {sequence.map((step, index) => (
        <StepForm
          key={index}
          step={step}
          machineCapabilities={machineCapabilities}
          updateStep={updateStep}
          deleteStep={deleteStep}
          isEditingExisting={isEditingExisting}
          localParameters={currentStepFormParams}
          stepData={handleStepData}
          onLocalParamsChange={(updatedLocalParams) =>
            setCurrentStepFormParams(updatedLocalParams)
          }
        />
      ))}
      <div className='mt-6 justify-center flex space-x-4'>
        <button
          onClick={addStep}
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-400'
        >
          Add New Step
        </button>
        <button
          onClick={generateSequence}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-400'
        >
          Generate Sequence
        </button>
      </div>
    </div>
  )
}

export default SequenceEditor
