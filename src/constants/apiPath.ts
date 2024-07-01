const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const punchRecordsApi = (start: string, end: string) =>
  `${baseURL}/api/punch-records?start_time=${start}&end_time=${end}`;
export const correctionRequestApi = `${baseURL}/api/correction`;
export const correctionsPunchRecordsApi = (start: string, end: string) =>
  `${baseURL}/api/correction?start_time=${start}&end_time=${end}`;
