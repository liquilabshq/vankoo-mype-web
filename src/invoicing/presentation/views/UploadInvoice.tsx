import {Send} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {useInvoicingStore} from '../../application/invoicing.store';
import {UploadInvoiceCommand} from '../../domain/model/upload-invoice.command';
import {InvoiceDropzone} from '../components/InvoiceDropzone';
import {InvoiceRail} from '../components/InvoiceRail';
import {InvoicingErrorAlert} from '../components/InvoicingErrorAlert';
import {KycGateAlert} from '../components/KycGate';
import {useCanUploadInvoices} from '../use-can-upload-invoices';
import {UploadedFileCard} from '../components/UploadedFileCard';
import {invoicingPaths} from '../invoicing-paths';
import {RAIL_MILESTONES} from '../rail-caption';

/** How big a `File.size` (in bytes) reads to a person. */
function formatFileSize(bytes: number): string {
    const megabytes = bytes / (1024 * 1024);
    if (megabytes >= 0.1) return `${megabytes.toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Routed view where a MYPE submits an invoice for the platform to read and validate.
 *
 * Choosing a file only stages it: nothing leaves the browser until «Enviar factura»,
 * so the MYPE does one deliberate thing and knows it did. Once the service has the
 * file, the screen hands over to the invoice's detail, which follows the read live
 * and is where any review, offer or rejection appears.
 */
export function UploadInvoice() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const canUpload = useCanUploadInvoices();
    const submitting = useInvoicingStore(state => state.submitting);
    const errors = useInvoicingStore(state => state.errors);
    const uploadInvoice = useInvoicingStore(state => state.uploadInvoice);
    const clearErrors = useInvoicingStore(state => state.clearErrors);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // An error from an earlier visit says nothing about this one.
    useEffect(() => {
        clearErrors();
    }, [clearErrors]);

    const steps = RAIL_MILESTONES.map(milestone => ({label: t(`invoicing.upload.steps.${milestone}`)}));

    function handleFileSelected(file: File) {
        clearErrors();
        setSelectedFile(file);
    }

    async function handleSend() {
        if (!selectedFile) return;
        const invoiceId = await uploadInvoice(new UploadInvoiceCommand({file: selectedFile}));
        if (invoiceId) navigate(invoicingPaths.invoiceDetail(invoiceId));
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <h1 className="text-h1 text-fg font-bold">{t('invoicing.upload.title')}</h1>

            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                {!canUpload && <KycGateAlert />}
                <InvoicingErrorAlert errors={errors} />

                {selectedFile ? (
                    <>
                        <UploadedFileCard
                            fileName={selectedFile.name}
                            fileDetail={`${formatFileSize(selectedFile.size)} · ${t('invoicing.upload.readyToSend')}`}
                            onRemove={submitting ? undefined : () => setSelectedFile(null)}
                            removeLabel={t('invoicing.upload.removeFile')}
                        />
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-caption text-fg-muted">{t('invoicing.upload.sendHint')}</p>
                            <Button
                                type="button"
                                size="lg"
                                onClick={() => void handleSend()}
                                disabled={submitting || !canUpload}
                                className="shrink-0"
                            >
                                {submitting ? <Spinner data-icon="inline-start" /> : <Send data-icon="inline-start" />}
                                {submitting ? t('invoicing.upload.sending') : t('invoicing.upload.send')}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <InvoiceDropzone
                            title={t('invoicing.upload.dropzone.cta')}
                            hint={t('invoicing.upload.dropzone.hint')}
                            onFileSelected={handleFileSelected}
                            disabled={!canUpload}
                        />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.helper')}</p>
                    </>
                )}
            </div>

            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                <p className="text-body text-fg font-semibold">{t('invoicing.upload.afterTitle')}</p>
                <InvoiceRail steps={steps} />
                <p className="text-caption text-fg-muted">{t('invoicing.upload.afterBody')}</p>
            </div>
        </div>
    );
}
