/* eslint-disable */
function deepFind(obj: any, path: string) {
  const paths = path.split('.');
  let i; let current = obj;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}
/* eslint-enable */

/**
 * @whatItDoes Create url from url-template and variables
 *
 * @howToUse
 *
 * ```
 * const urlTemplate = new UrlTemplate('http://path/:id?q=:query&f=:filter');
 *
 * const url = urlTemplate.createUrl({id: 12, query: 'abc'});
 *
 * //url = 'http://path/12?q=abc&f='
 * ```
 *
 * @description The url-template instance can create urls by using different values for filling placeholders
 *
 * @stable
 */
export class UrlTemplate {
  public placeholders: string[] = [];

  private placeholderRegexp = /([:])([^0-9?#&\/][^?#&\/]*)/g; // placeholder has js-variable shape with `:` before

  constructor(

    /** The template string with :x placeholders */
    public template: string,

    /** The object with default values */
    public defaultValues?: any
  ) {
    if (template) {
      this.placeholders = (template.match(this.placeholderRegexp) || []).map(placeholder => placeholder.slice(1));
    }
  }

  /** Creates url by using stored template and values */
  createUrl(values?: any): string {
    values = Object.assign({}, this.defaultValues, values);

    const segments = [];
    const placeholders: string[] = [];
    let p; let s; let i = 0; let lastIndex = 0;

    /* eslint-disable */
    while (p = this.placeholderRegexp.exec(this.template)) {
      s = this.template.substring(lastIndex, p.index);
      segments.push(s);
      segments.push(i++);
      placeholders.push(p[2]);
      lastIndex = this.placeholderRegexp.lastIndex;
    }
    /* eslint-enable */

    segments.push(this.template.substring(lastIndex));

    const valuesArr = placeholders.map(placeholder => deepFind(values, placeholder));

    return segments.map(segment => typeof segment === 'number' ? valuesArr[segment] : segment).join('');
  }
}
