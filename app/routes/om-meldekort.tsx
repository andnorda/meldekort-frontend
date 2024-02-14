import type { MetaFunction } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { Box, GuidePanel } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Generelt om meldekort" }
  ]
}

export default function OmMeldekort() {
  const { tt } = useExtendedTranslation()

  const innhold = <GuidePanel poster>
    <Box>
      {tt("genereltOmMeldekort.velkommen")}
    </Box>
    <Box>
      {tt("genereltOmMeldekort.velge")}
      <ul>
        <li>
          {tt("genereltOmMeldekort.valg.sende")}
        </li>
        <li>
          {tt("genereltOmMeldekort.valg.tidligere")}
        </li>
      </ul>
    </Box>
    <Box>
      {parseHtml(tt("genereltOmMeldekort.om.meldekort"),
        [
          "https://www.nav.no",
          tt("genereltOmMeldekort.informasjonOmMeldekortLink").trim()
        ]
      )}
    </Box>
    <Box>
      {tt("genereltOmMeldekort.oss")}
    </Box>
  </GuidePanel>

  return (
    <div>
      <MeldekortHeader />
      <Sideinnhold tittel={tt("overskrift.genereltOmMeldekort")} innhold={innhold} />
    </div>
  )
}
