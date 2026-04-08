import { useState } from 'react'
import { preValidate } from '../../utils/anomalyDetector'

const INDIAN_STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']

export default function HouseholdForm({ user, onSubmit, onCancel }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    address: {
      houseNumber: '',
      street: '',
      ward: '',
      district: '',
      state: user.region.split('-')[0] === 'Delhi' ? 'Delhi' : '',
      pincode: ''
    },
    members: [{
      name: '',
      age: '',
      gender: 'Male',
      relation: 'Head',
      education: 'Graduate',
      occupation: 'Self-employed',
      maritalStatus: 'Married',
      religion: 'Hindu',
      caste: 'General',
      aadharLast4: '',
      disability: false,
      migrant: false
    }],
    householdInfo: {
      totalMembers: 1,
      monthlyIncome: '25000-50000',
      houseType: 'Pucca',
      ownership: 'Owned',
      rooms: 2,
      toilet: true,
      drinkingWater: 'Tap',
      electricity: true,
      lpgConnection: true,
      internet: false,
      vehiclesOwned: []
    }
  })

  const updateAddress = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
  }

  const updateMember = (index, field, value) => {
    const newMembers = [...formData.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setFormData(prev => ({ ...prev, members: newMembers }))
  }

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, {
        name: '',
        age: '',
        gender: 'Male',
        relation: 'Son',
        education: 'Graduate',
        occupation: 'Student',
        maritalStatus: 'Unmarried',
        religion: 'Hindu',
        caste: 'General',
        aadharLast4: '',
        disability: false,
        migrant: false
      }],
      householdInfo: { ...prev.householdInfo, totalMembers: prev.members.length + 1 }
    }))
  }

  const removeMember = (index) => {
    if (formData.members.length === 1) return
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
      householdInfo: { ...prev.householdInfo, totalMembers: prev.members.length - 1 }
    }))
  }

  const updateHouseholdInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      householdInfo: { ...prev.householdInfo, [field]: value }
    }))
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    const warnings = preValidate(formData)
    if (warnings.length > 0) {
      const proceed = window.confirm('Warnings detected:\n' + warnings.join('\n') + '\n\nSubmit anyway?')
      if (!proceed) return
    }
    onSubmit(formData)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="form-steps">
        <div className={'form-step ' + (step >= 1 ? 'completed' : '') + (step === 1 ? ' active' : '')}>
          <div className="form-step-circle">1</div>
          <div className="form-step-label">Address</div>
        </div>
        <div className={'form-step ' + (step >= 2 ? 'completed' : '') + (step === 2 ? ' active' : '')}>
          <div className="form-step-circle">2</div>
          <div className="form-step-label">Members</div>
        </div>
        <div className={'form-step ' + (step >= 3 ? 'completed' : '') + (step === 3 ? ' active' : '')}>
          <div className="form-step-circle">3</div>
          <div className="form-step-label">Household Info</div>
        </div>
        <div className={'form-step ' + (step === 4 ? 'active' : '')}>
          <div className="form-step-circle">4</div>
          <div className="form-step-label">Review</div>
        </div>
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Address Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">House Number</label>
                <input className="form-input" value={formData.address.houseNumber} onChange={(e) => updateAddress('houseNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Street Name</label>
                <input className="form-input" value={formData.address.street} onChange={(e) => updateAddress('street', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ward</label>
                <input className="form-input" value={formData.address.ward} onChange={(e) => updateAddress('ward', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input className="form-input" value={formData.address.district} onChange={(e) => updateAddress('district', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-select" value={formData.address.state} onChange={(e) => updateAddress('state', e.target.value)}>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" value={formData.address.pincode} onChange={(e) => updateAddress('pincode', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Household Members</h2>
            <div className="member-list">
              {formData.members.map((member, idx) => (
                <div key={idx} className="member-card">
                  {idx > 0 && (
                    <button className="btn btn-sm btn-danger member-remove" onClick={() => removeMember(idx)}>Remove</button>
                  )}
                  <h4 style={{ marginBottom: '16px' }}>Member {idx + 1}</h4>
                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={member.name} onChange={(e) => updateMember(idx, 'name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input className="form-input" type="number" value={member.age} onChange={(e) => updateMember(idx, 'age', parseInt(e.target.value))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={member.gender} onChange={(e) => updateMember(idx, 'gender', e.target.value)}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Relation to Head</label>
                      <select className="form-select" value={member.relation} onChange={(e) => updateMember(idx, 'relation', e.target.value)}>
                        <option>Head</option>
                        <option>Spouse</option>
                        <option>Son</option>
                        <option>Daughter</option>
                        <option>Parent</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <select className="form-select" value={member.education} onChange={(e) => updateMember(idx, 'education', e.target.value)}>
                        <option>Illiterate</option>
                        <option>Primary</option>
                        <option>Secondary</option>
                        <option>Graduate</option>
                        <option>Post-Graduate</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Occupation</label>
                      <select className="form-select" value={member.occupation} onChange={(e) => updateMember(idx, 'occupation', e.target.value)}>
                        <option>Farmer</option>
                        <option>Self-employed</option>
                        <option>Government</option>
                        <option>Private Sector</option>
                        <option>Daily Wage</option>
                        <option>Student</option>
                        <option>Homemaker</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marital Status</label>
                      <select className="form-select" value={member.maritalStatus} onChange={(e) => updateMember(idx, 'maritalStatus', e.target.value)}>
                        <option>Married</option>
                        <option>Unmarried</option>
                        <option>Widowed</option>
                        <option>Divorced</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Caste Category</label>
                      <select className="form-select" value={member.caste} onChange={(e) => updateMember(idx, 'caste', e.target.value)}>
                        <option>General</option>
                        <option>OBC</option>
                        <option>SC</option>
                        <option>ST</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Aadhar Last 4</label>
                      <input className="form-input" maxLength="4" value={member.aadharLast4} onChange={(e) => updateMember(idx, 'aadharLast4', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline mt-16" onClick={addMember}>+ Add Member</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Household Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Total Members</label>
                <input className="form-input" type="number" disabled value={formData.householdInfo.totalMembers} />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Income</label>
                <select className="form-select" value={formData.householdInfo.monthlyIncome} onChange={(e) => updateHouseholdInfo('monthlyIncome', e.target.value)}>
                  <option>Below 10000</option>
                  <option>10000-25000</option>
                  <option>25000-50000</option>
                  <option>50000-100000</option>
                  <option>Above 100000</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">House Type</label>
                <select className="form-select" value={formData.householdInfo.houseType} onChange={(e) => updateHouseholdInfo('houseType', e.target.value)}>
                  <option>Pucca</option>
                  <option>Semi-Pucca</option>
                  <option>Kutcha</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ownership</label>
                <select className="form-select" value={formData.householdInfo.ownership} onChange={(e) => updateHouseholdInfo('ownership', e.target.value)}>
                  <option>Owned</option>
                  <option>Rented</option>
                  <option>Government</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Rooms</label>
                <input className="form-input" type="number" value={formData.householdInfo.rooms} onChange={(e) => updateHouseholdInfo('rooms', parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Drinking Water Source</label>
                <select className="form-select" value={formData.householdInfo.drinkingWater} onChange={(e) => updateHouseholdInfo('drinkingWater', e.target.value)}>
                  <option>Tap</option>
                  <option>Well</option>
                  <option>Tanker</option>
                  <option>River</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.householdInfo.toilet} onChange={(e) => updateHouseholdInfo('toilet', e.target.checked)} />
                <span>Toilet Available</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.householdInfo.electricity} onChange={(e) => updateHouseholdInfo('electricity', e.target.checked)} />
                <span>Electricity</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.householdInfo.lpgConnection} onChange={(e) => updateHouseholdInfo('lpgConnection', e.target.checked)} />
                <span>LPG Connection</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.householdInfo.internet} onChange={(e) => updateHouseholdInfo('internet', e.target.checked)} />
                <span>Internet Access</span>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Review & Submit</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4>Address</h4>
                <p>{formData.address.houseNumber}, {formData.address.street}, {formData.address.ward}</p>
                <p>{formData.address.district}, {formData.address.state} - {formData.address.pincode}</p>
              </div>
              <div>
                <h4>Members ({formData.members.length})</h4>
                {formData.members.map((m, i) => (
                  <p key={i}>{i + 1}. {m.name}, {m.age} years, {m.gender}, {m.relation}</p>
                ))}
              </div>
              <div>
                <h4>Household Details</h4>
                <p>Income: {formData.householdInfo.monthlyIncome} | House: {formData.householdInfo.houseType} ({formData.householdInfo.ownership})</p>
                <p>Rooms: {formData.householdInfo.rooms} | Water: {formData.householdInfo.drinkingWater}</p>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 1 && <button className="btn btn-outline" onClick={handleBack}>Back</button>}
            {step < 4 && <button className="btn btn-primary" onClick={handleNext}>Next</button>}
            {step === 4 && <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
