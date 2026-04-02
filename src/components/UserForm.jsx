// components/UserForm.jsx
// this form is used by AddUser.jsx and EditUser.jsx

import { Field, Section, Input, Select } from "./FormElements"

export default function UserForm({ user, errors, focused, onField, onFocus, onBlur }) {

  const fp = (name) => ({
    onFocus: () => onFocus(name),
    onBlur:  () => onBlur(),
    focused: focused === name,
  })

  return (
    <Section title="User Details">

      <Field label="Username" required error={errors.username}>
        <Input name="username" value={user.username} onChange={onField}
          placeholder="e.g. johndoe" {...fp('username')} />
      </Field>

      <Field label="Email" required error={errors.email}>
        <Input name="email" type="email" value={user.email} onChange={onField}
          placeholder="john@example.com" {...fp('email')} />
      </Field>

      <Field label="First Name" error={errors.first_name}>
        <Input name="first_name" value={user.first_name} onChange={onField}
          placeholder="John" {...fp('first_name')} />
      </Field>

      <Field label="Last Name" error={errors.last_name}>
        <Input name="last_name" value={user.last_name} onChange={onField}
          placeholder="Doe" {...fp('last_name')} />
      </Field>

<Field label="Phone Number" error={errors.phone_number}>
  <Input name="phone_number" value={user.phone_number} onChange={onField}
    placeholder="e.g. 01-6616905" {...fp('phone_number')} />
</Field>

<Field label="Mobile Number" required error={errors.mobile_number}>
  <Input name="mobile_number" value={user.mobile_number} onChange={onField}
    placeholder="e.g. +977-9743211466" {...fp('mobile_number')} />
</Field>

      <Field label="Age" error={errors.age}>
        <Input name="age" type="number" min="18" value={user.age} onChange={onField}
          placeholder="18+" {...fp('age')} />
      </Field>

      <Field label="Gender" error={errors.gender}>
        <Select name="gender" value={user.gender} onChange={onField} options={[
          { value: 'male',   label: 'Male'   },
          { value: 'female', label: 'Female' },
          { value: 'other',  label: 'Other'  },
        ]} />
      </Field>

      <Field label="Address" error={errors.address}>
        <Input name="address" value={user.address} onChange={onField}
          placeholder="Kathmandu, Nepal" {...fp('address')} />
      </Field>

    </Section>
  )
}