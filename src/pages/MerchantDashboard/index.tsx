import { Alert, DatePicker, Form, Input, InputNumber, Modal, Table, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'

import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/Button'
import type { CreateOfferFormValues } from '@/pages/MerchantDashboard/types'
import { useMerchantDashboard } from '@/pages/MerchantDashboard/useMerchantDashboard'
import { OfferStatus, type IMerchantOffer } from '@/store/reducers/offers/types'

const STATUS_LABEL: Record<OfferStatus, string> = {
  [OfferStatus.Active]: 'Ativa',
  [OfferStatus.Closed]: 'Encerrada',
  [OfferStatus.SoldOut]: 'Esgotada',
  [OfferStatus.Expired]: 'Expirada'
}

/** Dashboard do merchant: lista suas offers (com contagem de interest), cria e encerra offers. */
function MerchantDashboard(): ReactNode {
  const {
    loading,
    error,
    offers,
    isModalOpen,
    createLoading,
    createError,
    closeLoading,
    handleOpenModal,
    handleCloseModal,
    handleCreateSubmit,
    handleClose,
    handleSoftReload
  } = useMerchantDashboard()

  return (
    <>
      <AppHeader onLogoClick={handleSoftReload} />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, paddingTop: 88 }}>
        <Typography.Title level={2}>Minhas ofertas</Typography.Title>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: 16 }}>
          Nova oferta
        </Button>
        <Table<IMerchantOffer>
          rowKey="id"
          loading={loading}
          dataSource={offers}
          pagination={false}
          columns={[
            { title: 'Título', dataIndex: 'title' },
            { title: 'Desconto', dataIndex: 'discountPercent', render: (value: number) => `${value}%` },
            { title: 'Estoque', dataIndex: 'stock' },
            { title: 'Interessados', dataIndex: 'interestCount' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status: OfferStatus) => <Tag>{STATUS_LABEL[status]}</Tag>
            },
            {
              title: '',
              key: 'actions',
              render: (_, offer) =>
                offer.status === OfferStatus.Active || offer.status === OfferStatus.SoldOut ? (
                  <Button
                    loading={closeLoading}
                    onClick={() => {
                      handleClose(offer.id)
                    }}
                  >
                    Encerrar
                  </Button>
                ) : null
            }
          ]}
        />
        <Modal title="Nova oferta" open={isModalOpen} onCancel={handleCloseModal} footer={null} destroyOnHidden>
          <Form<CreateOfferFormValues> layout="vertical" onFinish={handleCreateSubmit} requiredMark={false}>
            {createError && <Alert type="error" showIcon title={createError} style={{ marginBottom: 16 }} />}
            <Form.Item name="title" label="Título" rules={[{ required: true, min: 2, max: 120 }]}>
              <Input placeholder="50% OFF em todos os tênis" />
            </Form.Item>
            <Form.Item name="description" label="Descrição" rules={[{ required: true, min: 2, max: 1000 }]}>
              <Input.TextArea rows={3} placeholder="Detalhes da promoção" />
            </Form.Item>
            <Form.Item
              name="discountPercent"
              label="Desconto (%)"
              rules={[{ required: true, type: 'number', min: 0, max: 100 }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} max={100} />
            </Form.Item>
            <Form.Item name="stock" label="Estoque" rules={[{ required: true, type: 'number', min: 0 }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={0} />
            </Form.Item>
            <Form.Item name="validUntil" label="Válida até" rules={[{ required: true }]}>
              <DatePicker
                style={{ width: '100%' }}
                showTime
                format="DD/MM/YYYY HH:mm"
                disabledDate={(date) => date.isBefore(dayjs())}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" fullWidth loading={createLoading}>
                Publicar oferta
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  )
}

export default MerchantDashboard
