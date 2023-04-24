import { request, RequestUrlParam } from 'obsidian'
import { EmoUploader } from '../base/emo-uploader'
import { CheveretoParms } from '../parms/parms-chevereto'
import { ReqFormData } from '../utils/req-formdata'
import { CONTENT_TYPE_FORMDATA } from '../base/constants'

export class CheveretoUploader extends EmoUploader {
  parms!: CheveretoParms
  constructor (cheveretoParms: CheveretoParms) {
    super()
    this.parms = cheveretoParms
  }

  // here chevereto API should be look like this: https://imgloc.com/api/1/upload
  formatUrl (str: string): string {
    if (!str.startsWith('https://') && !str.startsWith('http://')) {
      str = 'https://' + str
    }
    if (str.endsWith('/')) { // remove '/'
      str = str.slice(0, -1)
    }
    return str
  }

  async upload (file: File): Promise<string> {
    const domain = this.formatUrl(this.parms.required.domain)
    const formData = new ReqFormData()
    await formData.addFile('source', file)
    const form = formData.pack()
    const req: RequestUrlParam = {
      url: domain,
      method: 'POST',
      headers: {
        'X-API-Key': this.parms.required.token,
        'Content-Type': CONTENT_TYPE_FORMDATA
      },
      body: form
    }
    return await new Promise((resolve, reject) => {
      request(req).then((res) => {
        const json = JSON.parse(res)
        let url = ''
        url = json.image.url
        const markdownText = `![Chevereto](${url})`
        resolve(markdownText)
      }).catch(err => {
        reject(err)
      })
    })
  }
}
