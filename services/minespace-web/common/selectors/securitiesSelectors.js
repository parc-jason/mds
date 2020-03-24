import { createSelector } from "reselect";
import * as securitiesReducer from "../reducers/securitiesReducer";

export const { getBonds } = securitiesReducer;

export const getBondTotals = createSelector([getBonds], (bonds) => {
  const getSum = () =>
    bonds
      .filter(({ bond_status_code }) => bond_status_code === "ACT")
      .reduce((a, b) => +a + +b.amount, 0);

  return {
    amountHeld: getSum(),
    count: bonds.length,
  };
});
