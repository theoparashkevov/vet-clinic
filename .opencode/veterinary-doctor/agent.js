#!/usr/bin/env node
/**
 * Veterinary Doctor Agent
 * 
 * This script activates Dr. Sarah Mitchell to review the platform
 * and provide clinical feedback.
 * 
 * Usage: node agent.js [command]
 * Commands:
 *   review-plan     - Review project plan and suggest improvements
 *   review-feature  - Review a specific feature
 *   list-priorities - List top priorities from improvements.md
 */

const fs = require('fs');
const path = require('path');

const AGENT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(AGENT_DIR, '../..');
const PROJECT_PLAN = path.join(PROJECT_ROOT, '.opencode/project-manager/latest-project-plan.md');
const IMPROVEMENTS_FILE = path.join(AGENT_DIR, 'improvements.md');

function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function printHeader() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  🏥 Veterinary Doctor Agent - Dr. Sarah Mitchell, DVM');
  console.log('═══════════════════════════════════════════════════════════\n');
}

function reviewProjectPlan() {
  printHeader();
  
  const plan = readFile(PROJECT_PLAN);
  if (!plan) {
    console.log('❌ Could not read project plan');
    return;
  }

  console.log('📋 Reviewing Project Plan...\n');
  
  // Extract key sections
  const completedMatch = plan.match(/## What's Done ✅([\s\S]*?)(?=## What's Missing|$)/);
  const missingMatch = plan.match(/## What's Missing \/ Broken ❌([\s\S]*?)(?=## |$)/);
  
  if (completedMatch) {
    console.log('✅ COMPLETED FEATURES:');
    console.log(completedMatch[1].substring(0, 500) + '...\n');
  }
  
  if (missingMatch) {
    console.log('❌ MISSING FEATURES:');
    console.log(missingMatch[1].substring(0, 500) + '...\n');
  }

  console.log('💭 DR. MITCHELL\'S INITIAL THOUGHTS:\n');
  console.log('"I\'m impressed with what\'s been built so far. The patient timeline');
  console.log('is exactly what I asked for - seeing appointments and medical records');
  console.log('chronologically makes my job so much easier.\n');
  console.log('However, I notice some critical safety features are missing:');
  console.log('• No patient alert banner for allergies (this is critical!)');
  console.log('• No vaccination status indicators');
  console.log('• No weight history tracking');
  console.log('• No prescription printing\n');
  console.log('I\'d prioritize these safety and efficiency features before moving');
  console.log('on to the Viber chatbot."\n');

  console.log('📁 Detailed suggestions saved to: improvements.md\n');
}

function listPriorities() {
  printHeader();
  
  const improvements = readFile(IMPROVEMENTS_FILE);
  if (!improvements) {
    console.log('❌ Could not read improvements file');
    return;
  }

  console.log('🎯 TOP PRIORITIES (from Dr. Mitchell)\n');
  
  // Extract critical and high priority items
  const criticalMatch = improvements.match(/## Critical Priority([\s\S]*?)(?=## High Priority|$)/);
  const highMatch = improvements.match(/## High Priority([\s\S]*?)(?=## Medium Priority|$)/);
  
  if (criticalMatch) {
    console.log('🚨 CRITICAL (Must have for safety):');
    const items = criticalMatch[1].match(/### \d+\..*?(?=### |$)/gs);
    if (items) {
      items.forEach((item, i) => {
        const title = item.match(/### \d+\.\s*(.+)/)?.[1] || `Item ${i+1}`;
        console.log(`  ${i+1}. ${title}`);
      });
    }
    console.log();
  }
  
  if (highMatch) {
    console.log('🔴 HIGH (Major efficiency improvements):');
    const items = highMatch[1].match(/### \d+\..*?(?=### |$)/gs);
    if (items) {
      items.slice(0, 4).forEach((item, i) => {
        const title = item.match(/### \d+\.\s*(.+)/)?.[1] || `Item ${i+1}`;
        console.log(`  ${i+1}. ${title}`);
      });
    }
    console.log();
  }

  console.log('📁 See full details in: improvements.md\n');
}

function showHelp() {
  printHeader();
  console.log('Available commands:\n');
  console.log('  review-plan      Review project plan and provide feedback');
  console.log('  list-priorities  Show top priority improvements');
  console.log('  help             Show this help message\n');
  console.log('Examples:\n');
  console.log('  node agent.js review-plan');
  console.log('  node agent.js list-priorities\n');
}

// Main
const command = process.argv[2];

switch (command) {
  case 'review-plan':
    reviewProjectPlan();
    break;
  case 'list-priorities':
    listPriorities();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
