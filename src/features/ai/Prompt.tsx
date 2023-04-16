import { api } from '../../utils/api'

export const Prompt = () => {
  const { data, status } = useGenerateRecipe()

  if (status === 'error') {
    return <>something went wrong</>
  }

  if (status === 'success') {
    return <div>{JSON.stringify(data)}</div>
  }

  return <>loading</>
}

function useGenerateRecipe() {
  const { data, status } = api.ai.generate.useQuery()

  return { data, status }
}
