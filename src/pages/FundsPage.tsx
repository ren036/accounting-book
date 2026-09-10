import { useState } from "react";
import { SegmentedControl, Title } from "@mantine/core";
import type { MonthlyBudget } from "../domain/budget";
import type { SavingsBucket, SavingsMovement } from "../domain/savings";
import type { Transaction } from "../domain/transaction";
import { BudgetPage } from "./BudgetPage";
import { SavingsPage } from "./SavingsPage";
import { PageLayout } from "../ui/layout";

type FundsPageProps = {
  transactions: Transaction[];
  budgets: MonthlyBudget[];
  savingsBuckets: SavingsBucket[];
  savingsMovements: SavingsMovement[];
  openingDisposableBalance: number;
  amountsHidden: boolean;
  initialTab?: "budget" | "savings";
  onBudgetsChanged: () => Promise<void>;
  onSavingsChanged: () => Promise<void>;
  onOpeningBalanceChange: (value: number) => Promise<void>;
  onOpenMonth: (month: string) => void;
};

export function FundsPage(props: FundsPageProps) {
  const [tab, setTab] = useState<"budget" | "savings">(
    props.initialTab ?? "savings",
  );

  return (
    <PageLayout header={
      <>
        <Title order={2} size="h4" ta="center">资金</Title>
        <SegmentedControl
          fullWidth
          data={[
            { label: "储蓄", value: "savings" },
            { label: "预算", value: "budget" },
          ]}
          value={tab}
          onChange={(value) => setTab(value as "budget" | "savings")}
        />
      </>
    }>
        {tab === "budget" ? (
          <BudgetPage
            transactions={props.transactions}
            budgets={props.budgets}
            onChanged={props.onBudgetsChanged}
            onOpenMonth={props.onOpenMonth}
          />
        ) : (
          <SavingsPage
            transactions={props.transactions}
            buckets={props.savingsBuckets}
            movements={props.savingsMovements}
            openingDisposableBalance={props.openingDisposableBalance}
            amountsHidden={props.amountsHidden}
            onChanged={props.onSavingsChanged}
            onOpeningBalanceChange={props.onOpeningBalanceChange}
          />
        )}
    </PageLayout>
  );
}
