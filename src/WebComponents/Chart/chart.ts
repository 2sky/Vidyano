namespace Vidyano.WebComponents {
    export abstract class Chart extends WebComponent {
        protected static colors: string[] = ["#4682B4", "#f44336", "#009688", "#e91e63", "#9c27b0", "#8bc34a", "#673ab7", "#ffc107", "#3f51b5", "#ff5722", "#2196f3", "#ffeb3b", "#03a9f4", "#4caf50", "#00bcd4", "#cddc39", "#795548", "#ff9800", "#607d8b"];
        chart: Vidyano.QueryChart;
    }
}