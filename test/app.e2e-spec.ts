import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  // vars
  const image_data = ""
  const measure_datetime = ""
  const customer_code = ""
  const measure_type= ""
  const measure_uuid = ""

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/ (POST)', () => {
    const requestData = {
      image_data: image_data,
      customer_code: customer_code,
      measure_datetime: measure_datetime,
      measure_type: measure_type
    }
  
    return request(app.getHttpServer())
    .post('/api/upload')
    .send(requestData)
    .expect(200)
    .then(response => {
      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'data confirmed successfully',
        measure_value: "mocked_value",
        measure_uuid: "mocked_uuid",
        _links: {
          image_url: {
            href: `/staticfiles/mocked_uuid.png`
          },
          self: { href: "/api/upload" },
          next: { href: "/api/confirm" },
          prev: { href: "/api/{customer-code}/list" }
        }
      })
    })
  })

  it('/ (PATCH)', () => {
    const requestData = {
      measure_uuid: measure_uuid,
      confirmed_value: 1015,
    }
  
    return request(app.getHttpServer())
    .patch('/api/confirm')
    .send(requestData)
    .expect(200)
    .then(response => {
      expect(response.body).toEqual({
        success: true,
        statusCode: 200,
        message: 'data confirmed successfully',
        measure_value: requestData.confirmed_value,
        measure_uuid: requestData.measure_uuid,
        _links: {
          image_url: {
            href: `/staticfiles/${requestData.measure_uuid}.png`
          },
          self: { href: "/api/upload" },
          next: { href: "/api/confirm" },
          prev: { href: "/api/{customer-code}/list" }
        }
      })
    })
  })

  it('/ (GET)', () => {
  
    const expectedResponseStructure = {
      customer_code: customer_code,
      measures: [
        {
          measure_uuid: expect.any(String),
          measure_datetime: expect.any(String),
          measure_type: expect.any(String),
          measure_value: expect.any(Number),
          has_confirmed: expect.any(Boolean),
          url_image: expect.any(String)
        }
      ]
    }
  
    return request(app.getHttpServer())
      .get(`/api/${customer_code}/list`)
      .expect(200)
      .then(response => {
        const responseBody = response.body
        
        expect(responseBody.customer_code).toBe(expectedResponseStructure.customer_code)
        
        expect(Array.isArray(responseBody.measures)).toBe(true)
        
        responseBody.measures.forEach(item => {
          expect(item).toEqual(expect.objectContaining(expectedResponseStructure.measures[0]))
        })
      })
  })

  afterAll(async () => {
    await app.close()
  })
})
