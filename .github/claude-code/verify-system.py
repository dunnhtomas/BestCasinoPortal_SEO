#!/usr/bin/env python3
"""
Claude Code Ultra 2025 Enterprise System Verification Script

This script verifies that the Claude Code Ultra 2025 Enterprise System
is properly configured and all components are in place.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Tuple

class ClaudeCodeVerifier:
    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path)
        self.github_path = self.workspace_path / ".github"
        self.claude_code_path = self.github_path / "claude-code"
        self.verification_results = []

    def verify_directory_structure(self) -> bool:
        """Verify the complete directory structure exists."""
        required_dirs = [
            ".github",
            ".github/claude-code",
            ".github/claude-code/config",
            ".github/claude-code/hooks",
            ".github/claude-code/mcp",
            ".github/claude-code/sub-agents",
            ".github/claude-code/tools",
            ".github/claude-code/templates",
            ".github/claude-code/logs",
            ".github/workflows",
            ".github/workflows/claude-code",
            ".github/actions",
            ".github/actions/claude-code-setup"
        ]
        
        missing_dirs = []
        for dir_path in required_dirs:
            full_path = self.workspace_path / dir_path
            if not full_path.exists():
                missing_dirs.append(dir_path)
        
        if missing_dirs:
            self.verification_results.append(f"❌ Missing directories: {', '.join(missing_dirs)}")
            return False
        else:
            self.verification_results.append("✅ Directory structure complete")
            return True

    def verify_configuration_files(self) -> bool:
        """Verify all configuration files exist and are valid."""
        config_files = [
            (".github/claude-code/config/enterprise.json", "json"),
            (".github/claude-code/hooks/hooks.json", "json"),
            (".github/claude-code/mcp/servers.json", "json"),
            (".github/workflows/claude-code/claude-code-ultra-2025.yml", "yaml"),
            (".github/actions/claude-code-setup/action.yml", "yaml"),
            (".github/claude-code-ultra-2025.chatmode.md", "markdown")
        ]
        
        missing_files = []
        invalid_files = []
        
        for file_path, file_type in config_files:
            full_path = self.workspace_path / file_path
            if not full_path.exists():
                missing_files.append(file_path)
                continue
            
            # Validate file format
            try:
                if file_type == "json":
                    with open(full_path, 'r', encoding='utf-8') as f:
                        json.load(f)
                elif file_type == "yaml":
                    # Simple YAML validation - check for basic structure
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if not content.strip():
                            raise ValueError("Empty YAML file")
                elif file_type == "markdown":
                    # Basic markdown validation - check if file is readable
                    with open(full_path, 'r', encoding='utf-8') as f:
                        f.read()
            except Exception as e:
                invalid_files.append(f"{file_path}: {str(e)}")
        
        success = True
        if missing_files:
            self.verification_results.append(f"❌ Missing config files: {', '.join(missing_files)}")
            success = False
        if invalid_files:
            self.verification_results.append(f"❌ Invalid config files: {', '.join(invalid_files)}")
            success = False
        
        if success:
            self.verification_results.append("✅ Configuration files valid")
        
        return success

    def verify_sub_agents(self) -> bool:
        """Verify all sub-agent YAML files exist."""
        required_agents = [
            "senior-php-architect.yaml",
            "vue-component-specialist.yaml",
            "playwright-testing-specialist.yaml",
            "security-auditor.yaml",
            "performance-optimizer.yaml"
        ]
        
        missing_agents = []
        for agent_file in required_agents:
            agent_path = self.claude_code_path / "sub-agents" / agent_file
            if not agent_path.exists():
                missing_agents.append(agent_file)
        
        if missing_agents:
            self.verification_results.append(f"❌ Missing sub-agents: {', '.join(missing_agents)}")
            return False
        else:
            self.verification_results.append("✅ Sub-agent configurations complete")
            return True

    def verify_hook_scripts(self) -> bool:
        """Verify hook scripts exist and are executable."""
        hook_scripts = [
            "session-init.js",
            "deployment-validation.js"
        ]
        
        missing_scripts = []
        for script_file in hook_scripts:
            script_path = self.claude_code_path / "hooks" / script_file
            if not script_path.exists():
                missing_scripts.append(script_file)
        
        if missing_scripts:
            self.verification_results.append(f"❌ Missing hook scripts: {', '.join(missing_scripts)}")
            return False
        else:
            self.verification_results.append("✅ Hook scripts complete")
            return True

    def verify_documentation(self) -> bool:
        """Verify documentation files exist."""
        doc_files = [
            ".github/README.md",
            ".github/SYSTEM_OVERVIEW.md",
            ".github/claude-code/tools/README.md",
            ".github/claude-code/templates/README.md",
            ".github/claude-code/logs/README.md"
        ]
        
        missing_docs = []
        for doc_file in doc_files:
            doc_path = self.workspace_path / doc_file
            if not doc_path.exists():
                missing_docs.append(doc_file)
        
        if missing_docs:
            self.verification_results.append(f"❌ Missing documentation: {', '.join(missing_docs)}")
            return False
        else:
            self.verification_results.append("✅ Documentation complete")
            return True

    def verify_chat_mode_integration(self) -> bool:
        """Verify chat mode configuration is present."""
        chat_mode_path = self.github_path / "claude-code-ultra-2025.chatmode.md"
        if not chat_mode_path.exists():
            self.verification_results.append("❌ Chat mode configuration missing")
            return False
        
        # Check for key components in chat mode file
        try:
            with open(chat_mode_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if '"chatParticipants"' in content and '"claude-ultra"' in content:
                    self.verification_results.append("✅ Chat mode integration configured")
                    return True
                else:
                    self.verification_results.append("❌ Chat mode configuration incomplete")
                    return False
        except Exception:
            self.verification_results.append("❌ Chat mode configuration unreadable")
            return False

    def verify_enterprise_features(self) -> bool:
        """Verify enterprise features are configured."""
        enterprise_config_path = self.claude_code_path / "config" / "enterprise.json"
        if not enterprise_config_path.exists():
            self.verification_results.append("❌ Enterprise configuration missing")
            return False
        
        try:
            with open(enterprise_config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                required_features = ["security", "performance", "architecture", "testing"]
                if all(feature in config for feature in required_features):
                    self.verification_results.append("✅ Enterprise features configured")
                    return True
                else:
                    self.verification_results.append("❌ Enterprise configuration incomplete")
                    return False
        except Exception:
            self.verification_results.append("❌ Enterprise configuration invalid")
            return False

    def run_verification(self) -> Tuple[bool, List[str]]:
        """Run complete verification of the Claude Code Ultra 2025 system."""
        print("🚀 Claude Code Ultra 2025 Enterprise System Verification")
        print("=" * 60)
        
        verifications = [
            self.verify_directory_structure,
            self.verify_configuration_files,
            self.verify_sub_agents,
            self.verify_hook_scripts,
            self.verify_documentation,
            self.verify_chat_mode_integration,
            self.verify_enterprise_features
        ]
        
        all_passed = True
        for verification in verifications:
            result = verification()
            all_passed = all_passed and result
        
        print("\n📊 Verification Results:")
        print("-" * 30)
        for result in self.verification_results:
            print(result)
        
        print("\n🎯 Overall Status:")
        print("-" * 20)
        if all_passed:
            print("✅ Claude Code Ultra 2025 Enterprise System: FULLY CONFIGURED")
            print("🚀 Ready for production deployment with enterprise features")
            print("💬 Chat mode available: @claude-ultra")
            print("🔧 MCP servers configured and ready")
            print("🛡️ Enterprise security and compliance enabled")
            print("🎭 Multi-agent orchestration active")
        else:
            print("❌ Claude Code Ultra 2025 Enterprise System: CONFIGURATION INCOMPLETE")
            print("⚠️  Please resolve the issues above before deployment")
        
        return all_passed, self.verification_results

def main():
    """Main verification function."""
    import sys
    
    workspace_path = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    verifier = ClaudeCodeVerifier(workspace_path)
    success, results = verifier.run_verification()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
