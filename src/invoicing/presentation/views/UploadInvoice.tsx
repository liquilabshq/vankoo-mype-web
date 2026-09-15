import {useTranslation} from 'react-i18next';
import {Spinner} from '@/components/ui/spinner';
import {useInvoicingStore} from '../../application/invoicing.store';
import {UploadInvoiceCommand} from '../../domain/model/upload-invoice.command';
import {InvoiceDropzone} from '../components/InvoiceDropzone';
import {InvoicingErrorAlert} from '../components/InvoicingErrorAlert';
import {UploadStepsRail} from '../components/UploadStepsRail';

/** Routed view where a MYPE submits an invoice for the platform to read and validate. */
export function UploadInvoice() {
    const {t} = useTranslation();
    const submitting = useInvoicingStore(state => state.submitting);
    const errors = useInvoicingStore(state => state.errors);
    const uploadedInvoiceId = useInvoicingStore(state => state.uploadedInvoiceId);
    const uploadInvoice = useInvoicingStore(state => state.uploadInvoice);
    const reset = useInvoicingStore(state => state.reset);

    const steps = [
        {label: t('invoicing.upload.steps.received')},
        {label: t('invoicing.upload.steps.reading')},
        {label: t('invoicing.upload.steps.validating')},
        {label: t('invoicing.upload.steps.approved')},
        {label: t('invoicing.upload.steps.inAuction')}
    ];

    async function handleFileSelected(file: File) {
        await uploadInvoice(new UploadInvoiceCommand({file}));
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <h1 className="text-h1 text-fg font-bold">{t('invoicing.upload.title')}</h1>

            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                <InvoicingErrorAlert errors={errors} />

                {uploadedInvoiceId ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <p className="text-body text-fg font-semibold">{t('invoicing.upload.success.title')}</p>
                        <p className="text-caption text-fg-muted">
                            {t('invoicing.upload.success.body', {id: uploadedInvoiceId})}
                        </p>
                        <button
                            type="button"
                            className="text-fg-link text-caption font-semibold hover:underline"
                            onClick={reset}
                        >
                            {t('invoicing.upload.uploadAnother')}
                        </button>
                    </div>
                ) : submitting ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <Spinner className="size-6" />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.submitting')}</p>
                    </div>
                ) : (
                    <InvoiceDropzone
                        title={t('invoicing.upload.dropzone.cta')}
                        hint={t('invoicing.upload.dropzone.hint')}
                        onFileSelected={handleFileSelected}
                    />
                )}

                <p className="text-caption text-fg-muted">{t('invoicing.upload.helper')}</p>
            </div>

            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                <p className="text-body text-fg font-semibold">{t('invoicing.upload.afterTitle')}</p>
                <UploadStepsRail steps={steps} />
                <p className="text-caption text-fg-muted">{t('invoicing.upload.afterBody')}</p>
            </div>
        </div>
    );
}
