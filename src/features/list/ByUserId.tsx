import { api } from '../../utils/api'

export function ListByUserId() {
  const { data, status } = api.list.byUserId.useQuery()

  if (status === 'error') {
    return <p>Something went wrong...</p>
  }

  if (status === 'success') {
    return <p className=''>{JSON.stringify(data)}</p>
  }

  return <p className=''>Loading...</p>
}
