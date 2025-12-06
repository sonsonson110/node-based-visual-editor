import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'

// Redux hooks with types
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export { useMapInteraction } from './useMapInteraction'