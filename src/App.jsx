import { useState } from "react"
import FileUploader from "./components/FileUploader"
import SequenceEditor from "./components/SequenceEditor"

function App() {
  const [machineCapabilities, setMachineCapabilities] = useState({})
  const [sequence, setSequence] = useState([])

  const handleMachineCapabilitiesUpload = (data) => {
    console.log("Machine Capabilities Loaded:", data)
    setMachineCapabilities(data)
  }

  const handleSequenceUpload = (data) => {
    if (data && data.Step) {
      console.log("Valid sequence data received:", data)
      setSequence(data.Step)
    } else {
      console.error(
        "Invalid sequence format: Missing or incorrect 'Step' key",
        data
      )
      alert("Invalid sequence format: Missing or incorrect 'Step' key")
      setSequence([])
    }
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900'>
      <h1 className='text-3xl font-serif mb-8'>Process Sequence Editor</h1>
      <div className='w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
        <FileUploader
          label={
            <span>
              Upload Machine Capabilities{" "}
              <span style={{ color: "red" }}>*</span>
            </span>
          }
          onFileLoaded={handleMachineCapabilitiesUpload}
        />
        <FileUploader
          label='Upload Sequence (Optional)'
          onFileLoaded={handleSequenceUpload}
        />
        {Object.keys(machineCapabilities).length > 0 ? (
          <SequenceEditor
            machineCapabilities={machineCapabilities}
            sequence={sequence}
            setSequence={setSequence}
          />
        ) : (
          <p className='text-red-500'>
            Please upload machine capabilities to proceed.
          </p>
        )}
      </div>
    </div>
  )
}

export default App
