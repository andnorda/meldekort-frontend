import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_MIN_SIDE_URL, TEST_URL } from "../helpers/setup";
import TidligereMeldekortKorrigering, {
  action,
  loader,
  meta,
  shouldRevalidate
} from "~/routes/tidligere-meldekort.$meldekortId.korriger";
import {
  jsonify,
  opprettTestMeldekort,
  opprettTestMeldekortdetaljer,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_PERSON_INFO
} from "../mocks/data";
import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";
import { createRemixStub } from "@remix-run/testing";
import { json } from "@remix-run/node";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";


describe("Korriger tidligere meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")
  vi.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (args: string[]) => args[1],
        i18n: {
          changeLanguage: () => new Promise(() => {
          }),
          setDefaultNamespace: (ns: string) => {
          }
        },
        ready: true
      }
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {
      }
    }
  }))

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())
  afterEach(() => {
    server.resetHandlers()
    cleanup()
  })

  const meldekortId = "1707156949"
  const request = new Request(TEST_URL + "/tidligere-meldekort/korriger")

  const checkLoader = async (meldekortId?: string) => {
    const response = await loader({
      request,
      params: { meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      feil: true,
      valgtMeldekort: undefined,
      meldekortdetaljer: null,
      personInfo: null,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  }

  const checkAction = async (baksystemFeil: boolean, innsending: IValideringsResultat | null) => {
    const body = new URLSearchParams({});

    const request = new Request(TEST_URL + "/person/meldekort", {
      method: "POST",
      body,
    });

    const response = await action({
      request,
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      baksystemFeil,
      innsending
    })
  }

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    await checkLoader()
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med historiskemeldekort", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await checkLoader(meldekortId)
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med meldekortdetaljer", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/${meldekortId}`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await checkLoader(meldekortId)
  })

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med personInfo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    await checkLoader(meldekortId)
  })

  test("Skal få feil = false og data fra backend", async () => {
    const meldekort = opprettTestMeldekort(Number(meldekortId))
    jsonify(meldekort)

    const meldekortdetaljerData = opprettTestMeldekortdetaljer(Number(meldekortId))
    jsonify(meldekortdetaljerData)

    const response = await loader({
      request,
      params: { meldekortId: meldekortId },
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      feil: false,
      valgtMeldekort: meldekort,
      meldekortdetaljer: meldekortdetaljerData,
      personInfo: TEST_PERSON_INFO,
      minSideUrl: TEST_MIN_SIDE_URL
    })
  })

  test("Skal få baksystemFeil = true når feil ved innsending av meldekort", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 })
      )
    )

    await checkAction(true, null)
  })

  test("Skal få FEIL resultat ved innsending av meldekort", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => HttpResponse.json(TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL, { status: 200 })
      )
    )

    await checkAction(false, TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL)
  })

  test("Skal få OK resultat ved innsending av meldekort", async () => {
    await checkAction(false, TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK)
  })

  test("Skal vise feilmelding hvis feil = true", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: TidligereMeldekortKorrigering,
        loader() {
          return json({
            feil: true,
            valgtMeldekort: undefined,
            nesteMeldekortId: undefined,
            nesteEtterregistrerteMeldekortId: undefined,
            personInfo: null,
            minSideUrl: ""
          })
        }
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal vise feilmelding hvis valgtMeldekort = undefined", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: TidligereMeldekortKorrigering,
        loader() {
          return json({
            feil: false,
            valgtMeldekort: undefined,
            nesteMeldekortId: undefined,
            nesteEtterregistrerteMeldekortId: undefined,
            personInfo: null,
            minSideUrl: ""
          })
        }
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal vise feilmelding hvis personInfo = null", async () => {
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: TidligereMeldekortKorrigering,
        loader() {
          return json({
            feil: false,
            valgtMeldekort: {
              meldeperiode: {
                fra: ""
              }
            },
            nesteMeldekortId: undefined,
            nesteEtterregistrerteMeldekortId: undefined,
            personInfo: null,
            minSideUrl: ""
          })
        }
      }
    ])

    render(<RemixStub />)

    await waitFor(() => screen.findByText("feilmelding.baksystem"))
  })

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Korriger tidligere meldekort" }
    ])
  })

  test("shouldRevalidate skal returnere false", async () => {
    expect(shouldRevalidate()).toBe(false)
  })
})