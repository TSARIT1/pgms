import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function DataTable({ columns, data, onView, onEdit, onDelete, onDownload, onSelectChange, highlightRows = [] }) {
  const [selectedRows, setSelectedRows] = useState([])
  
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const handleRowSelect = (index, row) => {
    let updatedSelection
    if (selectedRows.includes(index)) {
      updatedSelection = selectedRows.filter(i => i !== index)
    } else {
      updatedSelection = [...selectedRows, index]
    }
    setSelectedRows(updatedSelection)
    
    if (onSelectChange) {
      const selectedData = data.filter((_, i) => updatedSelection.includes(i))
      onSelectChange(selectedData)
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIndices = data.map((_, i) => i)
      setSelectedRows(allIndices)
      if (onSelectChange) {
        onSelectChange(data)
      }
    } else {
      setSelectedRows([])
      if (onSelectChange) {
        onSelectChange([])
      }
    }
  }

  return (
    <motion.div
      className="table-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {onSelectChange && (
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              {(onView || onEdit || onDelete || onDownload) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, idx) => (
                <motion.tr
                  key={idx}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: idx * 0.05 }}
                  className={`${highlightRows.includes(idx) ? 'highlighted' : ''} ${selectedRows.includes(idx) ? 'selected' : ''}`}
                  style={{
                    background: selectedRows.includes(idx) ? '#eff6ff' : 'transparent',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {onSelectChange && (
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.includes(idx)}
                        onChange={() => handleRowSelect(idx, row)}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={`${idx}-${col}`}>{row[col] || '-'}</td>
                  ))}
                  {(onView || onEdit || onDelete || onDownload) && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {onView && (
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => onView(row)}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            View
                          </button>
                        )}
                        {onEdit && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => onEdit(row)}
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </button>
                        )}
                        {onDownload && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => onDownload(row)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onSelectChange ? 1 : 0) + (onView || onEdit || onDelete || onDownload ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem' }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
