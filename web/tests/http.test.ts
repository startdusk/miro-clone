import { makeHttpReq } from '../src/hepler/http';


interface IHttpResposne<TResponse>  {
  code: number,
  message: string,
  success: boolean,
  data: TResponse,
}

describe('http', () => {
  test('makeHttpReq', async () => {
      const res = await makeHttpReq<null, IHttpResposne<any>>('/api/v1/user', 'GET')
  })
})
