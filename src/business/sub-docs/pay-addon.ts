interface PayAddon {
    readonly amount: number;
    readonly category: string; //can be: Year's End bonus
    readonly description: string; //can be: Year's End Bonus for 2021
    readonly frequency: string; //can be: hourly (H), daily (D), monthly (M), Bi-weekly (B), Yearly (Y)
    readonly endedAt: string;
    readonly startedAt: string;
    readonly type: string; // can be: bonus (B), discount (D), reimbursement (R), etc
  } 