import React from "react";
import { View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

// Memoized chart configurations
const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  style: {
    borderRadius: 12,
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#3B82F6",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#E5E7EB",
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 10,
  },
  paddingRight: 16,
};

const greenChartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  style: {
    borderRadius: 12,
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#10B981",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#E5E7EB",
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 10,
  },
};

interface WeeklyChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color: (opacity?: number) => string;
    }>;
  };
  width: number;
}

export const WeeklyChart = React.memo<WeeklyChartProps>(({ data, width }) => (
  <View className="overflow-hidden rounded-2xl bg-white" style={{ width }}>
    <BarChart
      data={data}
      width={width}
      height={180}
      chartConfig={chartConfig}
      style={{
        marginVertical: 0,
        borderRadius: 0,
        marginLeft: -30,
      }}
      showValuesOnTopOfBars={false}
      fromZero={true}
      yAxisLabel=""
      yAxisSuffix=""
      withHorizontalLabels={true}
    />
  </View>
));

interface FocusQualityChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color: (opacity?: number) => string;
      strokeWidth: number;
    }>;
  };
  width: number;
}

export const FocusQualityChart = React.memo<FocusQualityChartProps>(
  ({ data, width }) => (
    <View className="overflow-hidden rounded-2xl bg-white" style={{ width }}>
      <LineChart
        data={data}
        width={width}
        height={160}
        chartConfig={greenChartConfig}
        bezier
        style={{
          marginVertical: 0,
          borderRadius: 0,
          marginLeft: -25,
        }}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        fromZero={true}
      />
    </View>
  )
);

interface PieChartComponentProps {
  data: Array<{
    name: string;
    count?: number;
    totalTime?: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  width: number;
  accessor: "count" | "totalTime";
}

export const PieChartComponent = React.memo<PieChartComponentProps>(
  ({ data, width, accessor }) => (
    <View
      className="bg-white rounded-2xl p-4 items-center"
      style={{ width: "100%" }}
    >
      <PieChart
        data={data}
        width={width}
        height={200}
        chartConfig={chartConfig}
        accessor={accessor}
        backgroundColor="transparent"
        paddingLeft="0"
        hasLegend={false}
        absolute
      />
    </View>
  )
);
