import React, { useEffect, useState } from 'react'
import API from '../auth'

export default function Routine() {
  const [routine, setRoutine] = useState({ steps: [] })
  const [log, setLog] = useState({ 
    usedSteps: [], 
    notes: '', 
    skinCondition: { redness: 0, dryness: 0, acne: 0 } 
  })
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('routine')
  const [products, setProducts] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [routineRes, logsRes, productsRes] = await Promise.all([
        API.get('/routine'),
        API.get('/routine/logs'),
        API.get('/products?limit=50')
      ])
      
      setRoutine(routineRes.data || { steps: [] })
      setLogs(logsRes.data || [])
      setProducts(productsRes.data?.products || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStep = () => {
    setRoutine(r => ({
      ...r, 
      steps: [...r.steps, { 
        product: null, 
        productName: '',
        note: '', 
        timeOfDay: 'AM',
        order: r.steps.length + 1
      }]
    }))
  }

  const updateStep = (index, key, value) => {
    const steps = [...routine.steps]
    steps[index] = { ...steps[index], [key]: value }
    
    // If product is selected, auto-fill product name
    if (key === 'product' && value) {
      const product = products.find(p => p._id === value)
      if (product) {
        steps[index].productName = product.name
      }
    }
    
    setRoutine({ ...routine, steps })
  }

  const removeStep = (index) => {
    const steps = routine.steps.filter((_, i) => i !== index)
    setRoutine({ ...routine, steps })
  }

  const moveStep = (index, direction) => {
    const steps = [...routine.steps]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < steps.length) {
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]]
      setRoutine({ ...routine, steps })
    }
  }

  const saveRoutine = async () => {
    try {
      const { data } = await API.post('/routine', routine)
      setRoutine(data)
      alert('Routine saved successfully!')
    } catch (error) {
      console.error('Error saving routine:', error)
      alert('Failed to save routine')
    }
  }

  const saveLog = async () => {
    if (!log.notes.trim() && log.usedSteps.length === 0) {
      alert('Please add some notes or used products')
      return
    }

    try {
      await API.post('/routine/log', {
        ...log,
        date: new Date().toISOString().split('T')[0]
      })
      
      // Reset log form
      setLog({ 
        usedSteps: [], 
        notes: '', 
        skinCondition: { redness: 0, dryness: 0, acne: 0 } 
      })
      
      // Reload logs
      const { data } = await API.get('/routine/logs')
      setLogs(data || [])
      
      alert('Daily log saved successfully!')
    } catch (error) {
      console.error('Error saving log:', error)
      alert('Failed to save log')
    }
  }

  const timeOfDayOptions = [
    { value: 'AM', label: '🌅 Morning', color: '#fbbf24' },
    { value: 'PM', label: '🌙 Evening', color: '#6366f1' }
  ]

  const getSkinConditionColor = (value) => {
    if (value <= 3) return '#10b981'
    if (value <= 6) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Loading your skincare routine...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '16px',
          color: '#1f2937'
        }}>
          Skincare Routine Tracker
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Build your personalized routine and track your skin's progress
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '30px',
        background: '#f3f4f6',
        padding: '4px',
        borderRadius: '12px',
        width: 'fit-content',
        margin: '0 auto 30px auto'
      }}>
        {[
          { id: 'routine', label: '📋 My Routine', icon: '🧴' },
          { id: 'log', label: '📝 Daily Log', icon: '📊' },
          { id: 'progress', label: '📈 Progress', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#1f2937' : '#6b7280',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Routine Builder Tab */}
      {activeTab === 'routine' && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              Build Your Routine
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={addStep}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                ➕ Add Step
              </button>
              <button
                onClick={saveRoutine}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                💾 Save Routine
              </button>
            </div>
          </div>

          {routine?.steps?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🧴</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                Start Building Your Routine
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Add products to create your personalized skincare routine
              </p>
              <button
                onClick={addStep}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ➕ Add Your First Product
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {routine.steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#fafafa'
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 200px 1fr auto',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    {/* Product Selection */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Product
                      </label>
                      <select
                        value={step.product || ''}
                        onChange={(e) => updateStep(index, 'product', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {product.brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time of Day */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        When
                      </label>
                      <select
                        value={step.timeOfDay}
                        onChange={(e) => updateStep(index, 'timeOfDay', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        {timeOfDayOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Notes
                      </label>
                      <input
                        type="text"
                        value={step.note || ''}
                        onChange={(e) => updateStep(index, 'note', e.target.value)}
                        placeholder="Usage notes..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        style={{
                          background: index === 0 ? '#f3f4f6' : '#e5e7eb',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '4px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === routine.steps.length - 1}
                        style={{
                          background: index === routine.steps.length - 1 ? '#f3f4f6' : '#e5e7eb',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '4px',
                          cursor: index === routine.steps.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => removeStep(index)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Log Tab */}
      {activeTab === 'log' && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            Today's Log
          </h2>

          {/* Used Products */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Products Used Today
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px'
            }}>
              {routine.steps.map((step, index) => (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: log.usedSteps.includes(step.product) ? '#f0f9ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={log.usedSteps.includes(step.product)}
                    onChange={(e) => {
                      const usedSteps = e.target.checked
                        ? [...log.usedSteps, step.product]
                        : log.usedSteps.filter(id => id !== step.product)
                      setLog({ ...log, usedSteps })
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '14px' }}>
                    {step.productName || 'Unnamed Product'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Skin Condition */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              Skin Condition (0-10 scale)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {['redness', 'dryness', 'acne'].map(condition => (
                <div key={condition}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {condition}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={log.skinCondition[condition]}
                    onChange={(e) => setLog({
                      ...log,
                      skinCondition: {
                        ...log.skinCondition,
                        [condition]: Number(e.target.value)
                      }
                    })}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: getSkinConditionColor(log.skinCondition[condition])
                  }}>
                    {log.skinCondition[condition]}/10
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Daily Notes
            </label>
            <textarea
              value={log.notes}
              onChange={(e) => setLog({ ...log, notes: e.target.value })}
              placeholder="How did your skin feel today? Any reactions or improvements?"
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={saveLog}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '16px'
            }}
          >
            📝 Save Today's Log
          </button>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            Your Progress
          </h2>

          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1f2937'
              }}>
                No logs yet
              </h3>
              <p style={{ color: '#6b7280' }}>
                Start logging your daily routine to track your progress
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {logs.slice(0, 7).map((logEntry, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '12px',
                    padding: '16px',
                    background: '#fafafa'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {new Date(logEntry.date).toLocaleDateString()}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['redness', 'dryness', 'acne'].map(condition => (
                        <span
                          key={condition}
                          style={{
                            background: `${getSkinConditionColor(logEntry.skinCondition?.[condition] || 0)}20`,
                            color: getSkinConditionColor(logEntry.skinCondition?.[condition] || 0),
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {condition}: {logEntry.skinCondition?.[condition] || 0}
                        </span>
                      ))}
                    </div>
                  </div>
                  {logEntry.notes && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      "{logEntry.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
