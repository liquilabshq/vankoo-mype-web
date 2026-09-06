import {useId, useState} from 'react';
import {ChevronLeft} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {AuthLayout} from '../components/AuthLayout';
import {iamPaths} from '../iam-paths';

/**
 * Routed view that would start a password reset.
 *
 * The form is real and the submit button is permanently disabled, because iam-service
 * has no recovery endpoint, no reset token and no mail transport — the whole feature
 * is unbuilt on the server. Shipping a button that quietly did nothing, or that faked
 * a confirmation, would be worse than shipping one that says so.
 */
export function RecoverPassword() {
    const {t} = useTranslation();
    const emailId = useId();
    const [email, setEmail] = useState('');

    return (
        <AuthLayout>
            <Link
                className="text-caption text-fg-link inline-flex items-center gap-1 font-semibold hover:underline"
                to={iamPaths.signIn()}
            >
                <ChevronLeft className="size-4" />
                {t('iam.recover.back')}
            </Link>

            <h1 className="text-h1 text-fg mt-4 font-bold">{t('iam.recover.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">{t('iam.recover.subtitle')}</p>

            <div className="mt-6">
                <FieldGroup>
                    <Alert>
                        <AlertTitle>{t('iam.recover.unavailableTitle')}</AlertTitle>
                        <AlertDescription>{t('iam.recover.unavailableBody')}</AlertDescription>
                    </Alert>

                    <Field>
                        <FieldLabel htmlFor={emailId}>{t('iam.fields.email')}</FieldLabel>
                        <Input
                            id={emailId}
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            autoComplete="email"
                        />
                    </Field>

                    <Button type="button" size="lg" className="w-full" disabled>
                        {t('iam.recover.submit')}
                    </Button>
                </FieldGroup>
            </div>
        </AuthLayout>
    );
}
