/*
 * SYSTEM VERIFICATION TOOL
 * Validates that the Master Conductor system is working correctly
 * Provides diagnostic information and performance metrics
 */

class SystemVerification {
  constructor() {
    this.results = {};
    this.startTime = performance.now();
  }

  async runVerification() {
    console.log('🔍 Starting Master Conductor System Verification...');
    
    // Test 1: Check if MasterConductor is available
    this.testMasterConductorAvailability();
    
    // Test 2: Check coordinated subsystems
    this.testCoordinatedSubsystems();
    
    // Test 3: Test unified RAF loop
    this.testUnifiedRAFLoop();
    
    // Test 4: Test system coordination
    await this.testSystemCoordination();
    
    // Test 5: Performance metrics
    this.testPerformanceMetrics();
    
    // Generate report
    this.generateReport();
  }

  testMasterConductorAvailability() {
    console.log('📋 Test 1: Master Conductor Availability');
    
    this.results.masterConductor = {
      available: typeof window.masterConductor !== 'undefined',
      instance: window.masterConductor ? true : false,
      isActive: window.masterConductor ? window.masterConductor.isActive : false,
      timing: window.masterConductor ? window.masterConductor.timing : null
    };
    
    if (this.results.masterConductor.available) {
      console.log('✅ MasterConductor is available and initialized');
      console.log('📊 Current timing state:', this.results.masterConductor.timing);
    } else {
      console.log('❌ MasterConductor is not available');
    }
  }

  testCoordinatedSubsystems() {
    console.log('📋 Test 2: Coordinated Subsystems');
    
    const expectedSubsystems = [
      'CoordinatedScrollMaster',
      'CoordinatedChoreographedVisualizerSystem', 
      'CoordinatedZonePacingController'
    ];
    
    this.results.coordinated = {};
    expectedSubsystems.forEach(system => {
      const available = typeof window[system] !== 'undefined';
      this.results.coordinated[system] = available;
      
      if (available) {
        console.log(`✅ ${system} available`);
      } else {
        console.log(`❌ ${system} not available`);
      }
    });

    // Check if systems are registered with conductor
    if (window.masterConductor && window.masterConductor.systems) {
      console.log('📊 Registered systems:', Object.keys(window.masterConductor.systems));
      this.results.registeredSystems = Object.keys(window.masterConductor.systems);
    }
  }

  testUnifiedRAFLoop() {
    console.log('📋 Test 3: Unified RAF Loop');
    
    let rafCount = 0;
    const startTime = performance.now();
    
    // Monitor RAF calls for 1 second
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      rafCount++;
      return originalRAF.call(window, callback);
    };
    
    setTimeout(() => {
      window.requestAnimationFrame = originalRAF;
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (rafCount / duration) * 1000;
      
      this.results.rafLoop = {
        calls: rafCount,
        duration: duration,
        estimatedFPS: fps,
        unified: rafCount < 5 // Should be low if unified properly
      };
      
      console.log(`📊 RAF calls in 1s: ${rafCount}, Estimated FPS: ${fps.toFixed(2)}`);
      
      if (rafCount < 5) {
        console.log('✅ RAF loop appears to be unified (low call count)');
      } else {
        console.log('⚠️ Multiple RAF loops detected - may indicate coordination issues');
      }
    }, 1000);
  }

  async testSystemCoordination() {
    console.log('📋 Test 4: System Coordination');
    
    return new Promise((resolve) => {
      if (!window.masterConductor) {
        console.log('❌ Cannot test coordination - MasterConductor not available');
        this.results.coordination = { available: false };
        resolve();
        return;
      }

      // Test coordination by triggering a scroll event
      const originalScroll = window.scrollY;
      let coordinationEvents = 0;
      
      // Monitor coordination events
      const originalLog = console.log;
      console.log = function(...args) {
        if (args[0] && args[0].includes('Coordinated')) {
          coordinationEvents++;
        }
        return originalLog.apply(console, args);
      };
      
      // Trigger a small scroll
      window.scrollTo({ top: 100, behavior: 'smooth' });
      
      setTimeout(() => {
        // Restore original scroll position
        window.scrollTo({ top: originalScroll, behavior: 'auto' });
        console.log = originalLog;
        
        this.results.coordination = {
          available: true,
          events: coordinationEvents,
          working: coordinationEvents > 0
        };
        
        if (coordinationEvents > 0) {
          console.log(`✅ System coordination working (${coordinationEvents} coordination events)`);
        } else {
          console.log('⚠️ No coordination events detected during scroll test');
        }
        
        resolve();
      }, 1000);
    });
  }

  testPerformanceMetrics() {
    console.log('📋 Test 5: Performance Metrics');
    
    // Check memory usage
    const memInfo = performance.memory ? {
      used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
      limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    } : null;
    
    // Check timing performance
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    
    this.results.performance = {
      memory: memInfo,
      loadTime: loadTime,
      verificationTime: performance.now() - this.startTime
    };
    
    console.log('📊 Performance Metrics:');
    if (memInfo) {
      console.log(`   Memory: ${memInfo.used}MB / ${memInfo.total}MB (limit: ${memInfo.limit}MB)`);
    }
    console.log(`   Page Load Time: ${loadTime}ms`);
    console.log(`   Verification Time: ${this.results.performance.verificationTime.toFixed(2)}ms`);
  }

  generateReport() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    console.log('\n🎯 MASTER CONDUCTOR VERIFICATION REPORT');
    console.log('='*50);
    
    // Overall status
    const overallHealthy = 
      this.results.masterConductor?.available &&
      this.results.rafLoop?.unified &&
      (this.results.coordination?.working ?? true);
    
    console.log(`Overall Status: ${overallHealthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);
    console.log(`Verification Time: ${totalTime.toFixed(2)}ms\n`);
    
    // Detailed results
    console.log('📊 Detailed Results:');
    console.log('Master Conductor:', this.results.masterConductor?.available ? '✅' : '❌');
    console.log('Coordinated Systems:', 
      Object.values(this.results.coordinated || {}).filter(Boolean).length, '/', 
      Object.keys(this.results.coordinated || {}).length);
    console.log('RAF Loop Unified:', this.results.rafLoop?.unified ? '✅' : '⚠️');
    console.log('System Coordination:', this.results.coordination?.working ? '✅' : '⚠️');
    
    if (this.results.performance?.memory) {
      console.log(`Memory Usage: ${this.results.performance.memory.used}MB`);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!this.results.masterConductor?.available) {
      console.log('- Check that master-conductor.js is loaded properly');
    }
    if (!this.results.rafLoop?.unified) {
      console.log('- Multiple RAF loops detected - check for uncoordinated animations');
    }
    if (!this.results.coordination?.working) {
      console.log('- System coordination may not be working - check console for errors');
    }
    if (overallHealthy) {
      console.log('- System is operating correctly! 🎉');
    }
    
    console.log('\n' + '='*50);
    
    // Store results for external access
    window.verificationResults = this.results;
    
    return this.results;
  }
}

// Auto-run verification if this script is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for systems to initialize
    setTimeout(() => {
      window.systemVerification = new SystemVerification();
      
      // Provide easy access function
      window.runVerification = () => {
        window.systemVerification.runVerification();
      };
      
      console.log('🔧 System Verification Tool loaded.');
      console.log('💻 Run "runVerification()" in console to test the Master Conductor system.');
    }, 2000);
  });
}

// Export for manual use
window.SystemVerification = SystemVerification;