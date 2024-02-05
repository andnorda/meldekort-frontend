import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { loader } from "~/routes/tidligere-meldekort_";
import { jsonify, opprettTestMeldekort } from "../mocks/data";


describe("Tidligere meldekort", () => {
  vi.stubEnv("IS_LOCALHOST", "true")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterAll(() => server.close())

  test("Skal få feil = true og historiskeMeldekort = null når feil på backend", async () => {
    server.use(
      http.get(
        `${MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    )

    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: true, historiskeMeldekort: null })
  })

  test("Skal få feil = false og historiskeMeldekort-objektet fra backend", async () => {
    const meldekortId1 = 1707156949
    const meldekortId2 = 1707156950
    const historiskemeldekortData = [opprettTestMeldekort(meldekortId1), opprettTestMeldekort(meldekortId2)]
    jsonify(historiskemeldekortData)

    const response = await loader({
      request: new Request(TEST_URL + "/tidligere-meldekort"),
      params: {},
      context: {}
    })

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ feil: false, historiskeMeldekort: historiskemeldekortData })
  })
})
