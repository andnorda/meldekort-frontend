import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "@remix-run/react";
import type { ReactElement } from "react";
import { Alert, BodyLong, Box, Table } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { RemixLink } from "~/components/RemixLink";
import type { IPerson } from "~/models/person";
import { hentPerson } from "~/models/person";
import { json } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Send meldekort" },
  ];
};

export async function loader() {
  let feil = false
  let person: IPerson | null = null

  const personResponse = await hentPerson();

  if (!personResponse.ok) {
    feil = true
  } else {
    person = await personResponse.json();
  }

  return json({ feil, person });
}

export default function SendMeldekort() {
  const { t } = useTranslation();

  const { feil, person } = useLoaderData<typeof loader>();

  let innhold: ReactElement

  if (feil || !person) {
    innhold = <Alert variant="error">{parseHtml(t("feilmelding.baksystem"))}</Alert>
  } else {
    const nesteMeldekortId = person.meldekort[0].meldekortId

    innhold = <div>
      <BodyLong spacing>
        {parseHtml(t("sendMeldekort.info.kanSende"))}
      </BodyLong>
      <Table zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">{t("overskrift.periode")}</Table.HeaderCell>
            <Table.HeaderCell scope="col">{t("overskrift.dato")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {person.meldekort.map((meldekort) => {
            return (
              <Table.Row key={meldekort.meldekortId} shadeOnHover={false}>
                <Table.DataCell>
                  {t("overskrift.uke")} {formaterPeriodeTilUkenummer(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
                </Table.DataCell>
                <Table.DataCell>
                  {formaterPeriodeDato(meldekort.meldeperiode.fra, meldekort.meldeperiode.til)}
                </Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <Box padding="4" />

      <Box padding="4" borderColor="border-subtle" borderWidth="2" borderRadius="xlarge">
        <div>{parseHtml(t("sendMeldekort.info.neste"))}</div>
        <div>{parseHtml(t("sendMeldekort.info.eldstePerioden"))}</div>
        <div>{parseHtml(t("sendMeldekort.info.automatiskLedet"))}</div>
      </Box>

      <div className="buttons">
        <div />
        <RemixLink as="Button" variant="primary" to={`/send-meldekort/${nesteMeldekortId}`}>
          {t("naviger.neste")}
        </RemixLink>
      </div>
    </div>
  }

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={t("overskrift.innsending")} innhold={innhold} />
    </div>
  );
}
