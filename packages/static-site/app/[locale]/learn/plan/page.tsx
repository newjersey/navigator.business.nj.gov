import { notFound } from "next/navigation";

import { hasAppLocale } from "@/domain/i18n/locales";

interface PageParams {
  readonly locale: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

const PlanPage = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  return (
    <>
      <h1>Plan</h1>
    </>
  );
};

export default PlanPage;
