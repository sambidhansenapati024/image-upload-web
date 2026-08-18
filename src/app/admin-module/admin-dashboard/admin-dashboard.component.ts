import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Kpi {
  label: string;
  value: string;
  change: number; // positive = up, negative = down
  icon: string;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface PlanSlice {
  label: string;
  value: number; // percent, all slices should sum to 100
  colorVar: '--blue' | '--violet' | '--gray';
}

interface UploadType {
  label: string;
  value: number; // percent of max
  colorVar: '--blue' | '--violet';
}

interface SupportQuery {
  id: string;
  subject: string;
  user: string;
  status: 'open' | 'pending' | 'resolved';
  time: string;
}

interface SystemStatus {
  label: string;
  status: 'operational' | 'degraded';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  // ---------- KPI row ----------
  // TODO: replace with real values from an AdminStatsService
  kpis: Kpi[] = [
    { label: 'Total Users', value: '4,218', change: 8.2, icon: 'pi pi-users' },
    { label: 'Images Stored', value: '182,940', change: 12.6, icon: 'pi pi-images' },
    { label: 'Storage Used', value: '1.24 TB', change: 4.1, icon: 'pi pi-cloud' },
    { label: 'Open Support Queries', value: '17', change: -9.3, icon: 'pi pi-comments' },
  ];

  // ---------- Growth chart (last 7 days) ----------
  growthData: ChartPoint[] = [
    { label: 'Mon', value: 40 },
    { label: 'Tue', value: 55 },
    { label: 'Wed', value: 48 },
    { label: 'Thu', value: 70 },
    { label: 'Fri', value: 65 },
    { label: 'Sat', value: 80 },
    { label: 'Sun', value: 95 },
  ];

  // Computed in ngOnInit — SVG viewBox is 0 0 400 160
  chartLinePoints = '';
  chartAreaPath = '';

  // ---------- Plan distribution (donut) ----------
  planDistribution: PlanSlice[] = [
    { label: 'Free', value: 58, colorVar: '--gray' },
    { label: 'Pro', value: 33, colorVar: '--blue' },
    { label: 'Enterprise', value: 9, colorVar: '--violet' },
  ];

  // Computed in ngOnInit
  planDonutBackground = '';

  // ---------- Uploads by file type ----------
  uploadsByType: UploadType[] = [
    { label: 'Images (JPG/PNG)', value: 78, colorVar: '--blue' },
    { label: 'PDFs', value: 46, colorVar: '--violet' },
    { label: 'WebP', value: 31, colorVar: '--blue' },
    { label: 'Other', value: 12, colorVar: '--violet' },
  ];

  // ---------- Recent support queries ----------
  // TODO: replace with real data from SupportQueryService
  supportQueries: SupportQuery[] = [
    { id: 'SQ-1042', subject: 'Cannot restore deleted image', user: 'priya.nair@example.com', status: 'open', time: '12m ago' },
    { id: 'SQ-1041', subject: 'Storage limit not updating', user: 'daniel.k@example.com', status: 'pending', time: '48m ago' },
    { id: 'SQ-1040', subject: 'PDF export missing pages', user: 'amelia.ross@example.com', status: 'open', time: '1h ago' },
    { id: 'SQ-1039', subject: 'Billing question — annual plan', user: 'j.oduya@example.com', status: 'resolved', time: '3h ago' },
    { id: 'SQ-1038', subject: 'Slow upload speeds on mobile', user: 'kenji.t@example.com', status: 'pending', time: '5h ago' },
  ];

  // ---------- System status ----------
  systemStatus: SystemStatus[] = [
    { label: 'API', status: 'operational' },
    { label: 'Storage (S3)', status: 'operational' },
    { label: 'Image Processing', status: 'operational' },
    { label: 'Email', status: 'degraded' },
  ];

  ngOnInit(): void {
    this.buildGrowthChart();
    this.buildPlanDonut();
  }

  private buildGrowthChart(): void {
    const width = 400;
    const height = 160;
    const padding = 8;
    const max = Math.max(...this.growthData.map(d => d.value));
    const step = (width - padding * 2) / (this.growthData.length - 1);

    const points = this.growthData.map((d, i) => {
      const x = padding + i * step;
      const y = height - padding - (d.value / max) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    this.chartLinePoints = points.join(' ');
    this.chartAreaPath = `M${padding},${height - padding} L${points.join(' L')} L${width - padding},${height - padding} Z`;
  }

  private buildPlanDonut(): void {
    let cursor = 0;
    const stops = this.planDistribution.map(slice => {
      const start = cursor;
      const end = cursor + slice.value;
      cursor = end;
      return `var(${slice.colorVar}) ${start}% ${end}%`;
    });
    this.planDonutBackground = `conic-gradient(${stops.join(', ')})`;
  }
}