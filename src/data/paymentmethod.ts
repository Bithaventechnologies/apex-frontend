
export type PayField = {
  label: string;
  value: string;
  copy?: boolean;
};

export type PayMethod = {
  id: string;
  label: string;
  note: string;
  fields: PayField[];
  destinationLabel: string;
  destinationHint: string;
};

export const depositMethods: PayMethod[] = [
  {
    id: "btc",
    label: "Bitcoin (BTC)",
    note: "Send only Bitcoin to the Bitcoin wallet address provided.",
    fields: [
      {
        label: "Wallet address",
        value: "REPLACE-WITH-YOUR-BTC-ADDRESS",
        copy: true,
      },
    ],
    destinationLabel: "Your Bitcoin wallet address",
    destinationHint: "Enter your BTC wallet address",
  },
  {
    id: "sol",
    label: "Solana (SOL)",
    note: "Send only SOL using the Solana network.",
    fields: [
      {
        label: "Wallet address",
        value: "REPLACE-WITH-YOUR-SOL-ADDRESS",
        copy: true,
      },
    ],
    destinationLabel: "Your Solana wallet address",
    destinationHint: "Enter your SOL wallet address",
  },
  {
    id: "eth",
    label: "Ethereum (ETH)",
    note: "Send only ETH using the Ethereum network.",
    fields: [
      {
        label: "Wallet address",
        value: "REPLACE-WITH-YOUR-ETH-ADDRESS",
        copy: true,
      },
    ],
    destinationLabel: "Your Ethereum wallet address",
    destinationHint: "Enter your ETH wallet address",
  },
  {
    id: "usdt",
    label: "USDT (TRC20)",
    note: "Send only USDT on the TRC20 network. Other networks or coins may be lost.",
    fields: [
      {
        label: "Wallet address",
        value: "REPLACE-WITH-YOUR-USDT-TRC20-ADDRESS",
        copy: true,
      },
    ],
    destinationLabel: "Your USDT (TRC20) wallet address",
    destinationHint: "Enter your USDT TRC20 wallet address",
  },
];

export const withdrawalMethods: PayMethod[] = [
  {
    id: "bank",
    label: "Bank Transfer",
    note: "Withdraw to your bank account. Ensure your account details are correct.",
    fields: [],
    destinationLabel: "Bank account details",
    destinationHint: "Enter your bank name and account details",
  },
  {
    id: "btc",
    label: "Bitcoin (BTC)",
    note: "Withdraw Bitcoin to your BTC wallet address.",
    fields: [],
    destinationLabel: "Your Bitcoin wallet address",
    destinationHint: "Enter your BTC wallet address",
  },
  {
    id: "sol",
    label: "Solana (SOL)",
    note: "Withdraw SOL to your Solana wallet address.",
    fields: [],
    destinationLabel: "Your Solana wallet address",
    destinationHint: "Enter your SOL wallet address",
  },
  {
    id: "eth",
    label: "Ethereum (ETH)",
    note: "Withdraw ETH to your Ethereum wallet address.",
    fields: [],
    destinationLabel: "Your Ethereum wallet address",
    destinationHint: "Enter your ETH wallet address",
  },
  {
    id: "usdt",
    label: "USDT (TRC20)",
    note: "Withdraw USDT using the TRC20 network.",
    fields: [],
    destinationLabel: "Your USDT (TRC20) wallet address",
    destinationHint: "Enter your USDT TRC20 wallet address",
  },
];
