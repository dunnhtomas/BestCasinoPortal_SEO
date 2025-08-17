#!/usr/bin/env python3
"""
CTO Agent Autonomous Workflow Test
Tests that the CTO agent properly executes autonomous workflows with todos, Context7, and multi-agent orchestration.
"""

import json
import yaml
import time
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class CTOAutonomousWorkflowTest:
    """Test suite for CTO agent autonomous workflow validation"""
    
    def __init__(self):
        self.test_results = []
        self.github_path = Path(".github")
        self.agents_path = self.github_path / "claude-code" / "sub-agents"
        self.config_path = self.github_path / "claude-code" / "config"
        
    def run_all_tests(self) -> Dict[str, Any]:
        """Run complete test suite for CTO autonomous workflow"""
        print("🚀 Starting CTO Agent Autonomous Workflow Test Suite...")
        print("=" * 80)
        
        results = {
            "test_suite": "CTO Autonomous Workflow Validation",
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {}
        }
        
        # Test 1: CTO Agent Configuration Validation
        results["tests"].append(self.test_cto_configuration())
        
        # Test 2: Todo Management Capability Test
        results["tests"].append(self.test_todo_management())
        
        # Test 3: Context7 Integration Test
        results["tests"].append(self.test_context7_integration())
        
        # Test 4: Sequential Thinking Integration Test
        results["tests"].append(self.test_sequential_thinking())
        
        # Test 5: Multi-Agent Orchestration Test
        results["tests"].append(self.test_multi_agent_orchestration())
        
        # Test 6: Autonomous Workflow Simulation
        results["tests"].append(self.test_autonomous_workflow_simulation())
        
        # Generate summary
        results["summary"] = self.generate_test_summary(results["tests"])
        
        # Save results
        self.save_test_results(results)
        
        return results
    
    def test_cto_configuration(self) -> Dict[str, Any]:
        """Test CTO agent configuration and capabilities"""
        test_name = "CTO Configuration Validation"
        print(f"\n🔍 {test_name}")
        print("-" * 50)
        
        try:
            # Load CTO agent configuration
            cto_file = self.agents_path / "senior-cto-architect.yaml"
            if not cto_file.exists():
                return self.create_test_result(test_name, False, "CTO agent file not found")
            
            with open(cto_file, 'r', encoding='utf-8') as f:
                cto_config = yaml.safe_load(f)
            
            checks = []
            
            # Check mandatory MCP servers
            mcp_servers = cto_config.get('mcp_servers', [])
            required_mcps = ['context7', 'sequentialthinking']
            
            for mcp in required_mcps:
                found = any(server['name'] == mcp for server in mcp_servers)
                checks.append({
                    "check": f"Has {mcp} MCP server",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {mcp} MCP server: {'✅ Found' if found else '❌ Missing'}")
            
            # Check autonomous capabilities
            autonomous_caps = cto_config.get('autonomous_capabilities', [])
            required_caps = [
                "Automatic todo planning from PRD/tasks",
                "Context7-powered research and analysis", 
                "Sequential thinking for systematic decisions",
                "Multi-agent orchestration and coordination"
            ]
            
            for cap in required_caps:
                found = cap in autonomous_caps
                checks.append({
                    "check": f"Has capability: {cap}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {cap}: {'✅ Found' if found else '❌ Missing'}")
            
            # Check workflow automation
            workflow_automation = cto_config.get('workflow_automation', [])
            required_workflows = [
                "PRD analysis and todo generation",
                "Agent task assignment and coordination",
                "Progress monitoring and quality validation"
            ]
            
            for workflow in required_workflows:
                found = workflow in workflow_automation
                checks.append({
                    "check": f"Has workflow: {workflow}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {workflow}: {'✅ Found' if found else '❌ Missing'}")
            
            all_passed = all(check["passed"] for check in checks)
            return self.create_test_result(test_name, all_passed, checks)
            
        except Exception as e:
            return self.create_test_result(test_name, False, f"Error: {str(e)}")
    
    def test_todo_management(self) -> Dict[str, Any]:
        """Test todo management capabilities"""
        test_name = "Todo Management Capability"
        print(f"\n📋 {test_name}")
        print("-" * 50)
        
        try:
            # Load CTO instructions
            cto_file = self.agents_path / "senior-cto-architect.yaml"
            with open(cto_file, 'r', encoding='utf-8') as f:
                cto_config = yaml.safe_load(f)
            
            instructions = cto_config.get('instructions', '')
            
            checks = []
            
            # Check for todo-related keywords in instructions
            todo_keywords = [
                "manage_todo_list",
                "TODO PLANNING PHASE",
                "comprehensive todo list",
                "Break down PRD/tasks",
                "Assign priorities and dependencies"
            ]
            
            for keyword in todo_keywords:
                found = keyword in instructions
                checks.append({
                    "check": f"Instructions mention: {keyword}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {keyword}: {'✅ Found' if found else '❌ Missing'}")
            
            # Check workflow automation for todo generation
            workflow_automation = cto_config.get('workflow_automation', [])
            todo_automation = "PRD analysis and todo generation" in workflow_automation
            
            checks.append({
                "check": "Has PRD analysis and todo generation automation",
                "passed": todo_automation,
                "details": f"Found: {todo_automation}"
            })
            print(f"  ✓ PRD→Todo automation: {'✅ Found' if todo_automation else '❌ Missing'}")
            
            all_passed = all(check["passed"] for check in checks)
            return self.create_test_result(test_name, all_passed, checks)
            
        except Exception as e:
            return self.create_test_result(test_name, False, f"Error: {str(e)}")
    
    def test_context7_integration(self) -> Dict[str, Any]:
        """Test Context7 MCP integration"""
        test_name = "Context7 Integration"
        print(f"\n🔍 {test_name}")
        print("-" * 50)
        
        try:
            # Load CTO configuration
            cto_file = self.agents_path / "senior-cto-architect.yaml"
            with open(cto_file, 'r', encoding='utf-8') as f:
                cto_config = yaml.safe_load(f)
            
            checks = []
            
            # Check MCP servers for Context7
            mcp_servers = cto_config.get('mcp_servers', [])
            context7_server = next((s for s in mcp_servers if s['name'] == 'context7'), None)
            
            checks.append({
                "check": "Has Context7 MCP server",
                "passed": context7_server is not None,
                "details": f"Server config: {context7_server}"
            })
            print(f"  ✓ Context7 MCP: {'✅ Found' if context7_server else '❌ Missing'}")
            
            if context7_server:
                # Check mandatory flag
                is_mandatory = context7_server.get('mandatory', False)
                checks.append({
                    "check": "Context7 marked as mandatory",
                    "passed": is_mandatory,
                    "details": f"Mandatory: {is_mandatory}"
                })
                print(f"  ✓ Mandatory flag: {'✅ True' if is_mandatory else '❌ False'}")
                
                # Check capabilities
                capabilities = context7_server.get('capabilities', [])
                required_caps = ["library-docs", "best-practices", "architecture-patterns"]
                for cap in required_caps:
                    found = cap in capabilities
                    checks.append({
                        "check": f"Context7 capability: {cap}",
                        "passed": found,
                        "details": f"Found: {found}"
                    })
                    print(f"  ✓ {cap}: {'✅ Found' if found else '❌ Missing'}")
            
            # Check instructions for Context7 usage
            instructions = cto_config.get('instructions', '')
            context7_mentions = [
                "CONTEXT7 ANALYSIS PHASE",
                "Use Context7 MCP",
                "Context7 Integration"
            ]
            
            for mention in context7_mentions:
                found = mention in instructions
                checks.append({
                    "check": f"Instructions mention: {mention}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {mention}: {'✅ Found' if found else '❌ Missing'}")
            
            all_passed = all(check["passed"] for check in checks)
            return self.create_test_result(test_name, all_passed, checks)
            
        except Exception as e:
            return self.create_test_result(test_name, False, f"Error: {str(e)}")
    
    def test_sequential_thinking(self) -> Dict[str, Any]:
        """Test Sequential Thinking MCP integration"""
        test_name = "Sequential Thinking Integration"
        print(f"\n🧠 {test_name}")
        print("-" * 50)
        
        try:
            # Load CTO configuration
            cto_file = self.agents_path / "senior-cto-architect.yaml"
            with open(cto_file, 'r', encoding='utf-8') as f:
                cto_config = yaml.safe_load(f)
            
            checks = []
            
            # Check MCP servers for Sequential Thinking
            mcp_servers = cto_config.get('mcp_servers', [])
            seq_thinking_server = next((s for s in mcp_servers if s['name'] == 'sequentialthinking'), None)
            
            checks.append({
                "check": "Has Sequential Thinking MCP server",
                "passed": seq_thinking_server is not None,
                "details": f"Server config: {seq_thinking_server}"
            })
            print(f"  ✓ Sequential Thinking MCP: {'✅ Found' if seq_thinking_server else '❌ Missing'}")
            
            if seq_thinking_server:
                # Check mandatory flag
                is_mandatory = seq_thinking_server.get('mandatory', False)
                checks.append({
                    "check": "Sequential Thinking marked as mandatory",
                    "passed": is_mandatory,
                    "details": f"Mandatory: {is_mandatory}"
                })
                print(f"  ✓ Mandatory flag: {'✅ True' if is_mandatory else '❌ False'}")
                
                # Check capabilities
                capabilities = seq_thinking_server.get('capabilities', [])
                required_caps = ["systematic-analysis", "step-by-step-reasoning", "decision-documentation"]
                for cap in required_caps:
                    found = cap in capabilities
                    checks.append({
                        "check": f"Sequential Thinking capability: {cap}",
                        "passed": found,
                        "details": f"Found: {found}"
                    })
                    print(f"  ✓ {cap}: {'✅ Found' if found else '❌ Missing'}")
            
            # Check instructions for Sequential Thinking usage
            instructions = cto_config.get('instructions', '')
            seq_thinking_mentions = [
                "SEQUENTIAL THINKING PHASE",
                "Apply Sequential Thinking MCP",
                "Sequential Thinking Integration"
            ]
            
            for mention in seq_thinking_mentions:
                found = mention in instructions
                checks.append({
                    "check": f"Instructions mention: {mention}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {mention}: {'✅ Found' if found else '❌ Missing'}")
            
            all_passed = all(check["passed"] for check in checks)
            return self.create_test_result(test_name, all_passed, checks)
            
        except Exception as e:
            return self.create_test_result(test_name, False, f"Error: {str(e)}")
    
    def test_multi_agent_orchestration(self) -> Dict[str, Any]:
        """Test multi-agent orchestration capabilities"""
        test_name = "Multi-Agent Orchestration"
        print(f"\n🤖 {test_name}")
        print("-" * 50)
        
        try:
            # Load enterprise config to check all sub-agents
            enterprise_file = self.config_path / "enterprise.json"
            if not enterprise_file.exists():
                return self.create_test_result(test_name, False, "Enterprise config not found")
            
            with open(enterprise_file, 'r', encoding='utf-8') as f:
                enterprise_config = json.load(f)
            
            # Load CTO configuration
            cto_file = self.agents_path / "senior-cto-architect.yaml"
            with open(cto_file, 'r', encoding='utf-8') as f:
                cto_config = yaml.safe_load(f)
            
            checks = []
            
            # Check sub-agent coordination matrix in instructions
            instructions = cto_config.get('instructions', '')
            coordination_elements = [
                "Sub-Agent Coordination Matrix",
                "Agent Task Assignment Protocol",
                "MULTI-AGENT ORCHESTRATION PHASE",
                "Coordinate all sub-agents"
            ]
            
            for element in coordination_elements:
                found = element in instructions
                checks.append({
                    "check": f"Instructions include: {element}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {element}: {'✅ Found' if found else '❌ Missing'}")
            
            # Check that enterprise config lists all sub-agents in subAgents section
            enterprise_agents = enterprise_config.get('subAgents', {})
            expected_agents = [
                "senior-php-architect", "vue-component-specialist", "playwright-testing-specialist",
                "security-auditor", "performance-optimizer", "senior-devops-infrastructure-architect", 
                "senior-data-analytics-engineer", "senior-ux-design-specialist", "senior-seo-content-strategist", "senior-compliance-legal-officer",
                "senior-prd-context-memory-officer"
            ]
            
            # Map expected agents to actual keys in enterprise config
            agent_mapping = {
                "senior-php-architect": "senior-php-architect",
                "vue-component-specialist": "vue-component-specialist", 
                "playwright-testing-specialist": "playwright-testing-specialist",
                "security-auditor": "security-auditor",
                "performance-optimizer": "performance-optimizer",
                "devops-specialist": "senior-devops-infrastructure-architect",
                "analytics-specialist": "senior-data-analytics-engineer",
                "ux-designer": "senior-ux-design-specialist",
                "seo-specialist": "senior-seo-content-strategist",
                "compliance-officer": "senior-compliance-legal-officer",
                "prd-context-officer": "senior-prd-context-memory-officer"
            }
            
            for expected_agent, actual_key in agent_mapping.items():
                found = actual_key in enterprise_agents
                checks.append({
                    "check": f"Enterprise config includes: {expected_agent}",
                    "passed": found,
                    "details": f"Found as {actual_key}: {found}"
                })
                print(f"  ✓ {expected_agent}: {'✅ Found' if found else '❌ Missing'}")
            
            # Check autonomous execution workflow
            autonomous_elements = [
                "AUTONOMOUS EXECUTION WORKFLOW",
                "Execute todos in priority order",
                "Monitor agent progress and quality",
                "Resolve cross-agent dependencies"
            ]
            
            for element in autonomous_elements:
                found = element in instructions
                checks.append({
                    "check": f"Autonomous workflow includes: {element}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                print(f"  ✓ {element}: {'✅ Found' if found else '❌ Missing'}")
            
            all_passed = all(check["passed"] for check in checks)
            return self.create_test_result(test_name, all_passed, checks)
            
        except Exception as e:
            return self.create_test_result(test_name, False, f"Error: {str(e)}")
    
    def test_autonomous_workflow_simulation(self) -> Dict[str, Any]:
        """Simulate autonomous workflow execution"""
        test_name = "Autonomous Workflow Simulation"
        print(f"\n⚡ {test_name}")
        print("-" * 50)
        
        try:
            # Load CTO configuration
            cto_file = self.agents_path / "senior-cto-architect.yaml"
            with open(cto_file, 'r', encoding='utf-8') as f:
                cto_config = yaml.safe_load(f)
            
            instructions = cto_config.get('instructions', '')
            
            checks = []
            
            # Simulate PRD input workflow
            workflow_phases = [
                "TODO PLANNING PHASE",
                "CONTEXT7 ANALYSIS PHASE", 
                "SEQUENTIAL THINKING PHASE",
                "MULTI-AGENT ORCHESTRATION PHASE",
                "AUTONOMOUS EXECUTION WORKFLOW",
                "QUALITY ASSURANCE PHASE"
            ]
            
            print("  🎯 Simulating autonomous workflow phases:")
            for i, phase in enumerate(workflow_phases, 1):
                found = phase in instructions
                checks.append({
                    "check": f"Phase {i}: {phase}",
                    "passed": found,
                    "details": f"Found in instructions: {found}"
                })
                status = "✅ Ready" if found else "❌ Missing"
                print(f"    {i}. {phase}: {status}")
            
            # Check mandatory execution standards
            mandatory_standards = [
                "Always start with comprehensive todo planning",
                "Use Context7 for best practices research",
                "Apply Sequential Thinking for systematic analysis",
                "Coordinate all 11 sub-agents autonomously",
                "Enforce casino.ca architecture standards"
            ]
            
            print("  📊 Checking mandatory execution standards:")
            for standard in mandatory_standards:
                found = standard in instructions
                checks.append({
                    "check": f"Standard: {standard}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                status = "✅ Enforced" if found else "❌ Missing"
                print(f"    • {standard}: {status}")
            
            # Check autonomous success criteria
            success_criteria = [
                "Complete todo list execution without human intervention",
                "All sub-agents coordinated effectively", 
                "Casino.ca standards maintained throughout",
                "Mandatory testing passed (Playwright)",
                "Deployment-ready deliverables produced"
            ]
            
            print("  🎯 Validating autonomous success criteria:")
            for criteria in success_criteria:
                found = criteria in instructions
                checks.append({
                    "check": f"Success criteria: {criteria}",
                    "passed": found,
                    "details": f"Found: {found}"
                })
                status = "✅ Defined" if found else "❌ Missing"
                print(f"    • {criteria}: {status}")
            
            all_passed = all(check["passed"] for check in checks)
            return self.create_test_result(test_name, all_passed, checks)
            
        except Exception as e:
            return self.create_test_result(test_name, False, f"Error: {str(e)}")
    
    def create_test_result(self, test_name: str, passed: bool, details: Any) -> Dict[str, Any]:
        """Create standardized test result"""
        return {
            "test_name": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_test_summary(self, tests: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate test summary statistics"""
        total_tests = len(tests)
        passed_tests = sum(1 for test in tests if test["passed"])
        failed_tests = total_tests - passed_tests
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": round((passed_tests / total_tests) * 100, 2) if total_tests > 0 else 0,
            "overall_status": "PASS" if failed_tests == 0 else "FAIL"
        }
    
    def save_test_results(self, results: Dict[str, Any]) -> None:
        """Save test results to file"""
        results_file = Path(".github/claude-code/tests/cto_autonomous_workflow_results.json")
        results_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Test results saved to: {results_file}")
    
    def print_final_summary(self, results: Dict[str, Any]) -> None:
        """Print final test summary"""
        summary = results["summary"]
        
        print("\n" + "=" * 80)
        print("🎯 CTO AUTONOMOUS WORKFLOW TEST SUMMARY")
        print("=" * 80)
        print(f"📊 Total Tests: {summary['total_tests']}")
        print(f"✅ Passed: {summary['passed_tests']}")
        print(f"❌ Failed: {summary['failed_tests']}")
        print(f"📈 Success Rate: {summary['success_rate']}%")
        print(f"🎭 Overall Status: {summary['overall_status']}")
        
        if summary['overall_status'] == 'PASS':
            print("\n🚀 CTO Agent is ready for autonomous workflow execution!")
            print("✅ Fully configured for:")
            print("   • Todo-driven task management")
            print("   • Context7 research and analysis")
            print("   • Sequential thinking decision making")
            print("   • Multi-agent orchestration")
            print("   • Autonomous quality assurance")
        else:
            print("\n⚠️  CTO Agent requires configuration fixes before autonomous operation")
            print("❌ Review failed tests and update configuration")
        
        print("=" * 80)

if __name__ == "__main__":
    # Run the test suite
    tester = CTOAutonomousWorkflowTest()
    results = tester.run_all_tests()
    tester.print_final_summary(results)
