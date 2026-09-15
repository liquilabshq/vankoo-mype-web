import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {buttonVariants} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {useInvoicingStore} from '../../application/invoicing.store';
import {UploadInvoiceCommand} from '../../domain/model/upload-invoice.command';
import {InvoiceDropzone} from '../components/InvoiceDropzone';
import {InvoicingErrorAlert} from '../components/InvoicingErrorAlert';
import {UploadedFileCard} from '../components/UploadedFileCard';
import {UploadStepsRail} from '../components/UploadStepsRail';

/** How big a `File.size` (in bytes) reads to a person. */
function formatFileSize(bytes: number): string {
    const megabytes = bytes / (1024 * 1024);
    if (megabytes >= 0.1) return `${megabytes.toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Routed view where a MYPE submits an invoice for the platform to read and validate. */
export function UploadInvoice() {
    const {t} = useTranslation();
    const submitting = useInvoicingStore(state => state.submitting);
    const errors = useInvoicingStore(state => state.errors);
    const uploadedInvoiceId = useInvoicingStore(state => state.uploadedInvoiceId);
    const uploadInvoice = useInvoicingStore(state => state.uploadInvoice);
    const invoiceFileUrl = useInvoicingStore(state => state.invoiceFileUrl);
    const reset = useInvoicingStore(state => state.reset);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const steps = [
        {label: t('invoicing.upload.steps.received')},
        {label: t('invoicing.upload.steps.reading')},
        {label: t('invoicing.upload.steps.validating')},
        {label: t('invoicing.upload.steps.approved')},
        {label: t('invoicing.upload.steps.inAuction')}
    ];

    async function handleFileSelected(file: File) {
        setSelectedFile(file);
        const uploaded = await uploadInvoice(new UploadInvoiceCommand({file}));
        if (!uploaded) setSelectedFile(null);
    }

    function handleReset() {
        setSelectedFile(null);
        reset();
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <h1 className="text-h1 text-fg font-bold">{t('invoicing.upload.title')}</h1>

            <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                <InvoicingErrorAlert errors={errors} />

                {uploadedInvoiceId && selectedFile ? (
                    <>
                        <UploadedFileCard
                            fileName={selectedFile.name}
                            fileDetail={`${formatFileSize(selectedFile.size)} · ${t('invoicing.upload.uploadComplete')}`}
                            onRemove={handleReset}
                            removeLabel={t('invoicing.upload.removeFile')}
                        />
                        <UploadStepsRail steps={steps} currentIndex={1} />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.processingHelper')}</p>
                        <div className="flex items-start gap-4">
                            <a
                                href={invoiceFileUrl(uploadedInvoiceId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonVariants({variant: 'secondary'})}
                            >
                                {t('invoicing.upload.viewInvoice')}
                            </a>
                            <button
                                type="button"
                                onClick={handleReset}
                                className={cn(buttonVariants({variant: 'ghost'}), 'border-border-strong')}
                            >
                                {t('invoicing.upload.uploadAnother')}
                            </button>
                        </div>
                    </>
                ) : submitting ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <Spinner className="size-6" />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.submitting')}</p>
                    </div>
                ) : (
                    <>
                        <InvoiceDropzone
                            title={t('invoicing.upload.dropzone.cta')}
                            hint={t('invoicing.upload.dropzone.hint')}
                            onFileSelected={handleFileSelected}
                        />
                        <p className="text-caption text-fg-muted">{t('invoicing.upload.helper')}</p>
                    </>
                )}
            </div>

            {!uploadedInvoiceId && (
                <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col gap-6 rounded-xl border p-8">
                    <p className="text-body text-fg font-semibold">{t('invoicing.upload.afterTitle')}</p>
                    <UploadStepsRail steps={steps} />
                    <p className="text-caption text-fg-muted">{t('invoicing.upload.afterBody')}</p>
                </div>
            )}
        </div>
    );
}
