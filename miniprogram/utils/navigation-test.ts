// utils/navigation-test.ts
/**
 * Navigation testing utilities for verifying all navigation flows work correctly
 */

import { navigationManager } from './navigation';

export interface NavigationTestResult {
  testName: string;
  success: boolean;
  error?: string;
  duration?: number;
}

export class NavigationTester {
  private static instance: NavigationTester;
  private testResults: NavigationTestResult[] = [];

  static getInstance(): NavigationTester {
    if (!NavigationTester.instance) {
      NavigationTester.instance = new NavigationTester();
    }
    return NavigationTester.instance;
  }

  /**
   * Test all profile page navigation flows
   */
  async testProfilePageNavigation(): Promise<NavigationTestResult[]> {
    console.log('Starting profile page navigation tests...');
    this.testResults = [];

    const tests = [
      {
        name: 'Login Page Navigation',
        url: '/pages/login/index'
      },
      {
        name: 'Orders Page Navigation',
        url: '/pages/orders/index'
      },
      {
        name: 'Orders with Status Navigation',
        url: '/pages/orders/index?status=pending_payment'
      },
      {
        name: 'Balance Page Navigation',
        url: '/pages/balance/index'
      },
      {
        name: 'Points Page Navigation',
        url: '/pages/points/index'
      },
      {
        name: 'Cards Page Navigation',
        url: '/pages/cards/index'
      },
      {
        name: 'Coupons Page Navigation',
        url: '/pages/coupons/index'
      },
      {
        name: 'Task Center Navigation',
        url: '/pages/task-center/index'
      },
      {
        name: 'Address Page Navigation',
        url: '/pages/address/index'
      },
      {
        name: 'Personal Info Navigation',
        url: '/pages/personal-info/index'
      },
      {
        name: 'Account Security Navigation',
        url: '/pages/account-security/index'
      }
    ];

    for (const test of tests) {
      await this.runNavigationTest(test.name, test.url);
    }

    return this.testResults;
  }

  /**
   * Test deep linking functionality
   */
  async testDeepLinking(): Promise<NavigationTestResult[]> {
    console.log('Starting deep linking tests...');
    const deepLinkResults: NavigationTestResult[] = [];

    const deepLinkTests = [
      { section: 'orders', action: 'pending_payment' },
      { section: 'orders', action: 'pending_shipment' },
      { section: 'balance' },
      { section: 'points' },
      { section: 'cards' },
      { section: 'coupons' },
      { section: 'task-center' },
      { section: 'address' },
      { section: 'personal-info' },
      { section: 'account-security' }
    ];

    for (const testCase of deepLinkTests) {
      const startTime = Date.now();
      let success = false;
      let error: string | undefined;

      try {
        // Test deep link generation
        const deepLinkUrl = navigationManager.generateDeepLink(testCase);
        console.log(`Generated deep link: ${deepLinkUrl}`);

        // Test deep link parsing
        const parsed = navigationManager.parseDeepLink(deepLinkUrl);
        
        if (parsed && parsed.section === testCase.section) {
          if (testCase.action) {
            success = parsed.action === testCase.action;
            if (!success) {
              error = `Action mismatch: expected ${testCase.action}, got ${parsed.action}`;
            }
          } else {
            success = true;
          }
        } else {
          error = 'Deep link parsing failed or section mismatch';
        }

      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
      }

      const duration = Date.now() - startTime;
      const testName = `Deep Link: ${testCase.section}${testCase.action ? ` (${testCase.action})` : ''}`;

      deepLinkResults.push({
        testName,
        success,
        error,
        duration
      });
    }

    return deepLinkResults;
  }

  /**
   * Test tab bar navigation and highlighting
   */
  async testTabBarNavigation(): Promise<NavigationTestResult[]> {
    console.log('Starting tab bar navigation tests...');
    const tabBarResults: NavigationTestResult[] = [];

    const tabPages = [
      { name: 'Home Tab', url: '/pages/index/index' },
      { name: 'Category Tab', url: '/pages/category/index' },
      { name: 'Cart Tab', url: '/pages/cart/index' },
      { name: 'Profile Tab', url: '/pages/profile/index' }
    ];

    for (const tab of tabPages) {
      const startTime = Date.now();
      let success = false;
      let error: string | undefined;

      try {
        // Test tab switching
        await navigationManager.switchTab({ url: tab.url });
        success = true;
        console.log(`✓ Tab navigation successful: ${tab.name}`);
      } catch (err) {
        error = err instanceof Error ? err.message : 'Tab navigation failed';
        console.error(`✗ Tab navigation failed: ${tab.name}`, err);
      }

      const duration = Date.now() - startTime;

      tabBarResults.push({
        testName: tab.name,
        success,
        error,
        duration
      });
    }

    return tabBarResults;
  }

  /**
   * Run a single navigation test
   */
  private async runNavigationTest(testName: string, url: string): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      // Test navigation
      await navigationManager.navigateTo({ url });
      success = true;
      console.log(`✓ Navigation test passed: ${testName}`);
      
      // Navigate back to avoid page stack overflow
      await navigationManager.navigateBackSafely();
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Navigation failed';
      console.error(`✗ Navigation test failed: ${testName}`, err);
    }

    const duration = Date.now() - startTime;

    this.testResults.push({
      testName,
      success,
      error,
      duration
    });
  }

  /**
   * Run comprehensive navigation test suite
   */
  async runFullTestSuite(): Promise<{
    navigationTests: NavigationTestResult[];
    deepLinkTests: NavigationTestResult[];
    tabBarTests: NavigationTestResult[];
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      successRate: number;
    };
  }> {
    console.log('Running comprehensive navigation test suite...');

    const [navigationTests, deepLinkTests, tabBarTests] = await Promise.all([
      this.testProfilePageNavigation(),
      this.testDeepLinking(),
      this.testTabBarNavigation()
    ]);

    const allTests = [...navigationTests, ...deepLinkTests, ...tabBarTests];
    const totalTests = allTests.length;
    const passedTests = allTests.filter(test => test.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const summary = {
      totalTests,
      passedTests,
      failedTests,
      successRate
    };

    console.log('Navigation test suite completed:', summary);

    return {
      navigationTests,
      deepLinkTests,
      tabBarTests,
      summary
    };
  }

  /**
   * Generate test report
   */
  generateTestReport(results: {
    navigationTests: NavigationTestResult[];
    deepLinkTests: NavigationTestResult[];
    tabBarTests: NavigationTestResult[];
    summary: any;
  }): string {
    let report = '# Navigation Test Report\n\n';
    
    report += `## Summary\n`;
    report += `- Total Tests: ${results.summary.totalTests}\n`;
    report += `- Passed: ${results.summary.passedTests}\n`;
    report += `- Failed: ${results.summary.failedTests}\n`;
    report += `- Success Rate: ${results.summary.successRate.toFixed(2)}%\n\n`;

    const addTestSection = (title: string, tests: NavigationTestResult[]) => {
      report += `## ${title}\n\n`;
      tests.forEach(test => {
        const status = test.success ? '✅' : '❌';
        report += `${status} ${test.testName}`;
        if (test.duration) {
          report += ` (${test.duration}ms)`;
        }
        if (test.error) {
          report += `\n   Error: ${test.error}`;
        }
        report += '\n';
      });
      report += '\n';
    };

    addTestSection('Navigation Tests', results.navigationTests);
    addTestSection('Deep Link Tests', results.deepLinkTests);
    addTestSection('Tab Bar Tests', results.tabBarTests);

    return report;
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.testResults = [];
  }
}

// Export singleton instance
export const navigationTester = NavigationTester.getInstance();