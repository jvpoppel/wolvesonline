export class BaseApi {
  // Implementation code where T is the returned data shape
  public post<T>(url: string, data: any): Promise<T> {
    if(data == undefined) {
      return fetch(url, {method: "POST"})
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        });
    }
    return fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)})
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      });

  }
}
