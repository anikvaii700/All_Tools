import React from 'react';
import { FormTemplate } from '../types';
import { HouseRentReceiptRenderer } from './HouseRentReceiptRenderer';
import {
  GeneralReceiptRenderer,
  AgreementRenderer,
  ApplicationRenderer,
  BiodataRenderer,
  CertificateRenderer,
  MemoRenderer,
  CustomDocumentRenderer,
} from './GenericRenderers';

interface DocumentRendererProps {
  template: FormTemplate;
  data: Record<string, any>;
  showBorder?: boolean;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  template,
  data,
  showBorder = true,
}) => {
  switch (template.layoutType) {
    case 'house-rent-receipt':
      return <HouseRentReceiptRenderer data={data} showBorder={showBorder} />;

    case 'general-receipt':
      return <GeneralReceiptRenderer template={template} data={data} showBorder={showBorder} />;

    case 'agreement':
      return <AgreementRenderer template={template} data={data} showBorder={showBorder} />;

    case 'application':
      return <ApplicationRenderer template={template} data={data} showBorder={showBorder} />;

    case 'biodata':
      return <BiodataRenderer template={template} data={data} showBorder={showBorder} />;

    case 'certificate':
      return <CertificateRenderer template={template} data={data} showBorder={showBorder} />;

    case 'memo':
      return <MemoRenderer template={template} data={data} showBorder={showBorder} />;

    case 'custom':
    default:
      return <CustomDocumentRenderer template={template} data={data} showBorder={showBorder} />;
  }
};
