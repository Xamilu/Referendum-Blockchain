import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useContracts } from '../hooks/useContracts';

interface CreateProposalProps {
  signer: any;
}

export const CreateProposal: React.FC<CreateProposalProps> = ({ signer }) => {
  const [form] = Form.useForm();
  const { createProposal } = useContracts(signer);

  const handleSubmit = async (values: any) => {
    const result = await createProposal(values.title, values.description);
    if (result) {
      message.success('Proposition créée avec succès');
      form.resetFields();
    } else {
      message.error('Erreur lors de la création de la proposition');
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item 
        name="title" 
        label="Titre" 
        rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item 
        name="description" 
        label="Description" 
        rules={[{ required: true, message: 'Veuillez entrer une description' }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Créer une proposition
        </Button>
      </Form.Item>
    </Form>
  );
};