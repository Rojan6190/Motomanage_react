// components/VehicleForm.jsx
// Reusable form used by AddVehicle.jsx and EditVehicle.jsx
import { Field, Input, Select, Section } from './FormElements'

export default function VehicleForm({ vehicle, errors, focused, onField, onFocus, onBlur, onImage }) {
  const fp = (name) => ({
    onFocus: () => onFocus(name),
    onBlur:  () => onBlur(),
    focused: focused === name,
  })

  return (
    <Section title="Vehicle Details">
      <Field label="Brand" required error={errors.make}>
        <Input name="make" value={vehicle.make} onChange={onField}
          placeholder="e.g. Honda" {...fp('make')} />
      </Field>

      <Field label="Model" required error={errors.model}>
        <Input name="model" value={vehicle.model} onChange={onField}
          placeholder="e.g. CBR150R" {...fp('model')} />
      </Field>

      <Field label="Year" required error={errors.year}>
        <Input name="year" type="number" min="1900" value={vehicle.year}
          onChange={onField} placeholder="2022" {...fp('year')} />
      </Field>

      <Field label="Vehicle Type" error={errors.vehicle_type}>
        <Select name="vehicle_type" value={vehicle.vehicle_type} onChange={onField} options={[
          { value: 'two_wheeler',  label: 'Two Wheeler' },
          { value: 'four_wheeler', label: 'Four Wheeler' },
          { value: 'heavy',        label: 'Heavy Vehicle' },
        ]} />
      </Field>

      <Field label="Fuel Type" error={errors.fuel_type}>
        <Select name="fuel_type" value={vehicle.fuel_type} onChange={onField} options={[
          { value: 'petrol',   label: 'Petrol' },
          { value: 'diesel',   label: 'Diesel' },
          { value: 'electric', label: 'Electric' },
        ]} />
      </Field>

      <Field label="Vehicle Image">
        <input
          type="file"
          accept="image/*"
          onChange={onImage}
          style={{
            background: '#0f1117', border: '1px solid #2a2d3a',
            borderRadius: 6, padding: '8px 12px',
            color: '#a0a8b8', fontSize: 13, width: '100%',
            cursor: 'pointer', boxSizing: 'border-box',
          }}
        />
        {/* Show newly selected file name */}
        {vehicle.image instanceof File && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7080' }}>
            Selected: <span style={{ color: '#e8eaf0' }}>{vehicle.image.name}</span>
          </div>
        )}
        {/* Show existing image preview when editing */}
        {vehicle.image && typeof vehicle.image === 'string' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: '#6b7080', marginBottom: 4 }}>Current image:</div>
            <img
              src={vehicle.image}
              alt="Current vehicle"
              style={{ height: 64, borderRadius: 6, objectFit: 'cover', border: '1px solid #2a2d3a' }}
            />
          </div>
        )}
      </Field>
    </Section>
  )
}