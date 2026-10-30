import {FileText} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import {Button} from '@/components/ui/button';
import {EmptyState} from '../components/EmptyState';

/**
 * Shown for any URL the router does not recognise.
 *
 * It renders inside the shell, so it is the design's 404 card — the same `EmptyState`
 * the empty invoice list uses — rather than a page of its own, and a `div`: the
 * shell already owns the `main` landmark.
 */
export function NotFound() {
    const {t} = useTranslation();

    return (
        <div className="bg-surface-raised border-border-subtle shadow-elevation-1 flex flex-col items-center gap-6 rounded-xl border px-6 py-8">
            <EmptyState icon={FileText} title={t('notFound.title')} description={t('notFound.body')} />
            <Button size="lg" render={<Link to="/" />}>
                {t('notFound.back')}
            </Button>
        </div>
    );
}
