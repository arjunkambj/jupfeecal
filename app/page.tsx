"use client";

import { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Slider } from "@heroui/slider";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";

import { ThemeSwitch } from "@/components/theme-switch";
import { FeeCalculationParams, FeeBreakdown } from "@/types/fee-types";
import { ASSET_CONFIGS } from "@/config/jupiter-fees-config";
import {
  calculateTotalFees,
  formatUsd,
  formatPercentage,
} from "@/utils/fee-calculations";

const AmountInput = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) => (
  <Input
    endContent={
      <div className="pointer-events-none flex items-center">
        <span className="text-default-400 text-small">USD</span>
      </div>
    }
    label={label}
    placeholder="0.00"
    startContent={
      <div className="pointer-events-none flex items-center">
        <span className="text-default-400 text-small">$</span>
      </div>
    }
    type="number"
    value={value}
    onValueChange={onChange}
  />
);

const LeverageSlider = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-small text-default-500">Leverage</span>
      <Chip size="sm" variant="flat">
        {value}x
      </Chip>
    </div>
    <Slider
      aria-label="Leverage"
      className="max-w-full"
      marks={[
        { value: 1, label: "1x" },
        { value: 10, label: "10x" },
        { value: 25, label: "25x" },
        { value: 50, label: "50x" },
      ]}
      maxValue={50}
      minValue={1}
      size="sm"
      step={1}
      value={value}
      onChange={(val) => onChange(val as number)}
    />
  </div>
);

const AssetSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <Select
    label="Select Asset"
    placeholder="Choose an asset"
    selectedKeys={[value]}
    onSelectionChange={(keys) => onChange(Array.from(keys)[0] as string)}
  >
    {Object.keys(ASSET_CONFIGS).map((asset) => (
      <SelectItem key={asset}>{ASSET_CONFIGS[asset].symbol}</SelectItem>
    ))}
  </Select>
);

const DurationInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <Input
    endContent={
      <div className="pointer-events-none flex items-center">
        <span className="text-default-400 text-small">hours</span>
      </div>
    }
    label="Position Duration"
    placeholder="24"
    type="number"
    value={value}
    onValueChange={onChange}
  />
);

const FeeRow = ({
  label,
  amount,
  percentage,
  tooltip,
  variant = "default",
}: {
  label: string;
  amount: string;
  percentage: string;
  tooltip?: string;
  variant?: "default" | "highlight" | "total";
}) => {
  const rowContent = (
    <div
      className={`flex justify-between items-center py-2 ${
        variant === "total" ? "font-semibold text-large" : ""
      }`}
    >
      <span className={`${variant === "highlight" ? "text-primary" : ""}`}>
        {label}
      </span>
      <div className="flex gap-2 items-center">
        <span className={variant === "total" ? "text-primary" : ""}>
          {amount}
        </span>
        <Chip size="sm" variant={variant === "highlight" ? "flat" : "bordered"}>
          {percentage}
        </Chip>
      </div>
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{rowContent}</Tooltip>
  ) : (
    rowContent
  );
};

const FeeBreakdownCard = ({ breakdown }: { breakdown: FeeBreakdown }) => (
  <Card shadow="none">
    <CardHeader className="pb-0">
      <h3 className="text-lg font-semibold">Fee Breakdown</h3>
    </CardHeader>
    <CardBody className="space-y-1">
      <FeeRow
        amount={formatUsd(breakdown.baseFee)}
        label="Base Fee"
        percentage={formatPercentage(breakdown.baseFeePercentage)}
        tooltip="0.06% flat rate charged when opening, closing, or partially closing positions"
      />
      <FeeRow
        amount={formatUsd(breakdown.priceImpactFee)}
        label="Price Impact Fee"
        percentage={formatPercentage(breakdown.priceImpactFeePercentage)}
        tooltip="Simulates orderbook dynamics to prevent price manipulation and ensure fair compensation for JLP holders"
        variant="highlight"
      />
      <FeeRow
        amount={formatUsd(breakdown.borrowFee)}
        label="Borrow Fee (Borrow)"
        percentage={formatPercentage(breakdown.borrowFeePercentage)}
        tooltip={`Compounds hourly at ${formatUsd(breakdown.borrowFeeHourly)}/hr. Based on pool utilization and position duration`}
      />
      <FeeRow
        amount={formatUsd(breakdown.estimatedGasFee)}
        label="Est. Gas Fee"
        percentage="-"
        tooltip="Solana transaction and priority fees. SOL rent for escrow account (PDA) will be returned when position is closed"
      />
      <Divider className="my-2" />
      <FeeRow
        amount={formatUsd(breakdown.totalFees)}
        label="Total Fees"
        percentage={formatPercentage(breakdown.totalFeesPercentage)}
        variant="total"
      />
    </CardBody>
  </Card>
);

const AdvancedSettings = ({
  params,
  onUpdate,
}: {
  params: Partial<FeeCalculationParams>;
  onUpdate: (params: Partial<FeeCalculationParams>) => void;
}) => (
  <Card shadow="none">
    <CardHeader>
      <h3 className="text-lg font-semibold">Advanced Settings</h3>
    </CardHeader>
    <CardBody className="space-y-4">
      <Input
        label="Trade Impact Fee Scalar"
        type="number"
        value={params.tradeImpactFeeScalar?.toString() || "100000000"}
        onValueChange={(val) =>
          onUpdate({
            ...params,
            tradeImpactFeeScalar: parseInt(val) || 100000000,
          })
        }
      />
      <Slider
        aria-label="Utilization Rate"
        getValue={(val) => `${((val as number) * 100).toFixed(1)}%`}
        label="Utilization Rate"
        maxValue={1}
        minValue={0}
        size="sm"
        step={0.01}
        value={params.utilizationRate || 0.198}
        onChange={(val) =>
          onUpdate({ ...params, utilizationRate: val as number })
        }
      />
      <Input
        label="Hourly Funding (dBPS)"
        type="number"
        value={params.hourlyBorrowRate?.toString() || "0.606"}
        onValueChange={(val) =>
          onUpdate({
            ...params,
            hourlyBorrowRate: parseFloat(val) || 0.606,
          })
        }
      />
    </CardBody>
  </Card>
);

export default function Home() {
  const [tradeSize, setTradeSize] = useState("1000");
  const [leverage, setLeverage] = useState(10);
  const [asset, setAsset] = useState("SOL");
  const [duration, setDuration] = useState("24");
  const [isOpening, setIsOpening] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedParams, setAdvancedParams] = useState<
    Partial<FeeCalculationParams>
  >({});

  const feeBreakdown = useMemo(() => {
    const assetConfig = ASSET_CONFIGS[asset] || ASSET_CONFIGS["SOL"];

    return calculateTotalFees({
      tradeSizeUsd: parseFloat(tradeSize) || 0,
      leverage,
      isOpening,
      positionDurationHours: parseFloat(duration) || 0,
      asset,
      tradeImpactFeeScalar:
        advancedParams.tradeImpactFeeScalar || assetConfig.tradeImpactFeeScalar,
      utilizationRate:
        advancedParams.utilizationRate || assetConfig.defaultUtilization,
      hourlyBorrowRate:
        advancedParams.hourlyBorrowRate || assetConfig.defaultHourlyBorrowRate,
      ...advancedParams,
    });
  }, [tradeSize, leverage, isOpening, duration, asset, advancedParams]);

  const positionSize = (parseFloat(tradeSize) || 0) * leverage;

  return (
    <div className="container mx-auto max-w-7xl px-6 ">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Jupiter Perpetuals Fee Calculator
          </h1>
          <p className="text-default-500 mt-2">
            Calculate your trading fees with precision
          </p>
        </div>
        <ThemeSwitch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card shadow="none">
            <CardHeader>
              <h2 className="text-xl font-semibold">Trade Parameters</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AmountInput
                  label="Trade Size"
                  value={tradeSize}
                  onChange={setTradeSize}
                />
                <AssetSelector value={asset} onChange={setAsset} />
              </div>

              <LeverageSlider value={leverage} onChange={setLeverage} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DurationInput value={duration} onChange={setDuration} />
                <div className="flex items-center justify-center">
                  <Switch
                    isSelected={isOpening}
                    size="sm"
                    onValueChange={setIsOpening}
                  >
                    {isOpening ? "Opening Position" : "Closing Position"}
                  </Switch>
                </div>
              </div>

              {positionSize > 0 && (
                <div className="bg-default-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-small text-default-600">
                      Position Size:
                    </span>
                    <span className="font-semibold text-large">
                      {formatUsd(positionSize)}
                    </span>
                  </div>
                </div>
              )}
            </CardBody>
            <CardFooter>
              <Button
                size="sm"
                variant="flat"
                onPress={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
              </Button>
            </CardFooter>
          </Card>

          {showAdvanced && (
            <AdvancedSettings
              params={advancedParams}
              onUpdate={setAdvancedParams}
            />
          )}
        </div>

        <div className="space-y-6">
          <FeeBreakdownCard breakdown={feeBreakdown} />

          <Card shadow="none">
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Stats</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-small text-default-500">
                  Effective Leverage:
                </span>
                <Chip size="sm" variant="flat">
                  {leverage}x
                </Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-default-500">Asset:</span>
                <Chip size="sm" variant="flat">
                  {asset}
                </Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-default-500">Duration:</span>
                <Chip size="sm" variant="flat">
                  {duration} hrs
                </Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-small text-default-500">Total Cost:</span>
                <Chip color="warning" size="sm" variant="flat">
                  {formatPercentage(feeBreakdown.totalFeesPercentage)}
                </Chip>
              </div>
            </CardBody>
          </Card>

          <Card shadow="none">
            <CardBody>
              <Button
                fullWidth
                color="primary"
                variant="shadow"
                onPress={() => {
                  const text = `Jupiter Perpetuals Fee Calculation
Position Size: ${formatUsd(positionSize)}
Base Fee: ${formatUsd(feeBreakdown.baseFee)}
Price Impact: ${formatUsd(feeBreakdown.priceImpactFee)}
Borrow Fee: ${formatUsd(feeBreakdown.borrowFee)}
Total: ${formatUsd(feeBreakdown.totalFees)} (${formatPercentage(feeBreakdown.totalFeesPercentage)})`;

                  navigator.clipboard.writeText(text);
                }}
              >
                Copy Calculation
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
