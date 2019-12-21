import React from 'react';
import useForm from 'react-hook-form';
import styled from '@emotion/styled';
import { Input, FormError, Fieldset, Label, Form, Select } from './Forms';
import { Button } from './Button';
import { spacing } from '../../constants/style-guide';

const FieldType = {
  Select: 'select',
  Input: 'input',
  Checkbox: 'checkbox',
  Toggle: 'toggle',
};

const ButtonWrapper = styled('div')`
  margin-top: ${spacing.double}px;
`;

const renderSelect = (props) => {
  const { field, hookForm } = props;
  const { setValue, getValues, register } = hookForm;
  const { name } = field.attrs;
  // custom register
  register({ name, type: 'custom' }, { required: 'This field is required' });
  const values = getValues();
  const value = values[name];
  const valueOption = field.props.options.find((o) => o.value === value);

  const onSelect = (selectedOption) => {
    setValue(name, selectedOption.value);
  };

  return (
    <Select
      {...field.attrs}
      name={name}
      options={field.props.options}
      onChange={onSelect}
      value={valueOption}
    />
  );
};

const renderInput = (props) => {
  const { field, hookForm } = props;
  const { register } = hookForm;
  return (
    <Input
      {...props.field.attrs}
      ref={register({ required: field.attrs.required ? 'This field is required' : false })}
    />
  );
};

const renderFieldComp = (props) => {
  const { field } = props;
  switch (field.props.type) {
    case FieldType.Select:
      return renderSelect(props);
    default:
      return renderInput(props);
  }
};

const SchemaField = (props) => {
  const { field, hookForm } = props;
  const { errors } = hookForm;
  return (
    <Fieldset className={field.attrs.required ? 'required' : null}>
      <Label>{field.props.label}</Label>
      {renderFieldComp(props)}
      {errors[field.attrs.name] && <FormError>This field is required.</FormError>}
    </Fieldset>
  );
};

export const SchemaForm = ({ schema, onSubmit, isBusy, defaultValues = {} }) => {
  const hookForm = useForm({ defaultValues });
  const { handleSubmit } = hookForm;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {schema.fields.map((field) => (
        <SchemaField key={field.attrs.name} hookForm={hookForm} field={field} />
      ))}
      <ButtonWrapper>
        <Button isBusy={isBusy}>Submit</Button>
      </ButtonWrapper>
    </Form>
  );
};
