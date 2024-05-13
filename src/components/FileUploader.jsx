/* eslint-disable react/prop-types */
import { useState } from "react"

function FileUploader({ label, onFileLoaded, accept = ".json" }) {
  const [error, setError] = useState("")

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result)
          setError("")
          onFileLoaded(content)
        } catch (error) {
          setError("Error reading file: " + error.message)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className='max-w-sm mx-auto'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4'>
        <label className='block text-sm font-medium text-gray-700 dark:text-white mb-2'>
          {label}
        </label>
        <input
          type='file'
          onChange={handleFileChange}
          accept={accept}
          className='w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
          id='file_input'
        />
        {error && <div className='text-red-500 text-sm mt-1'>{error}</div>}
      </div>
    </div>
  )
}

export default FileUploader
