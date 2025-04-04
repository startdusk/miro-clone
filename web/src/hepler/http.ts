import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';
import { getUserToken, redirectLogin } from "./auth"


function httpTimeoutFunction(msg: string, timeout: number = 10000) {
  return new Promise<void>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(msg))
    }, timeout)
  })
}

type HttpVerbType = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface IHttpResposne<TResponse>  {
  code: number,
  message: string,
  success: boolean,
  data: TResponse,
}

/**
 * 构建http请求
 * @param endpoint 请求的endpoint
 * @param verb http请求方法
 * @param body 请求的body
 * @returns
 * 
 * @example
 * const resp = await makeHttpReq<{name: string}, IProjectResponse>(
 *   'projects',
 *   'PUT',
 *   {
 *     name: projectName
 *   }
 * )
 */
export function makeHttpReq<TInput extends {}, IResponse>(endpoint: string, verb: HttpVerbType, body?: TInput): Promise<IResponse> {
  const token = getUserToken()
  if (!token) {
    redirectLogin()
    return Promise.reject(new Error('No token'))
  }
  const postBody = body ? JSON.stringify(decamelizeKeys(body)) : undefined
  return new Promise(async (resolve, reject) => {
    try {
      const raceRes = Promise.race([
        fetch(`http://localhost:18888/api/${endpoint}`, {
          method: verb,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: postBody ? postBody : undefined,
        }),
        httpTimeoutFunction('Request timed out')
      ]) 
      const resJson = await raceRes as Response
      if (!resJson.ok) {
        reject(new Error('Request failed'))
        return
      }
      const jsonData = await resJson.json()
      const resData = camelcaseKeys(jsonData, {deep: true}) as IHttpResposne<IResponse>
      if (resData.success) {
        resolve(resData.data)
      } else {
        reject(new Error(resData.message))
      }
    } catch (e) {
      reject(e)
    }
  })
}