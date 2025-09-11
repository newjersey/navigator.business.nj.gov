#!/usr/bin/env python3
"""
Parse content collection files (Markdown, JSON, YAML) and generate CSV output.

This script can process content collections in three modes:
1. Process all collections (default when no arguments provided)
2. Process a specific collection by name (when NetlifyCMS config is available)
3. Process a specific directory by path (fallback or direct path specification)

Each mode extracts structured data from .md (YAML frontmatter + body), .json, and .yaml/.yml files,
and exports everything to CSV format with user-friendly column headers when NetlifyCMS configuration is available.
"""

import argparse
import csv
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple, Union, Optional, NamedTuple, Any

import yaml


class CollectionConfig(NamedTuple):
    """Configuration for a content collection from NetlifyCMS config.yml."""
    name: str
    label: str
    folder: str
    field_labels: Dict[str, str]  # field_name -> user_friendly_label


class ContentData(NamedTuple):
    """Parsed content from a markdown file with structured data."""
    frontmatter: Dict[str, Union[str, int, bool]]
    body: str
    filename: str


def load_netlifycms_config_if_exists(config_path: Path) -> Optional[Dict[str, Any]]:
    """
    Load NetlifyCMS config file if it exists.
    
    Args:
        config_path: Path to the web/public/mgmt/config.yml file
        
    Returns:
        Parsed config dictionary or None if file doesn't exist
        
    Raises:
        yaml.YAMLError: If the config file exists but has invalid YAML
    """
    if not config_path.exists():
        return None
        
    try:
        with open(config_path, 'r', encoding='utf-8') as file:
            return yaml.safe_load(file)
    except yaml.YAMLError as e:
        raise yaml.YAMLError(f"Invalid YAML in config file {config_path}: {e}")


def extract_collection_configs_from_netlifycms_config(config: Dict[str, Any]) -> Dict[str, CollectionConfig]:
    """
    Extract collection configurations from NetlifyCMS config.
    
    Args:
        config: Parsed NetlifyCMS configuration dictionary
        
    Returns:
        Dictionary mapping collection names to CollectionConfig objects
    """
    collections = {}
    
    for collection in config.get('collections', []):
        name = collection.get('name', '')
        label = collection.get('label', name)
        folder = collection.get('folder', '')
        
        # Skip collections that are just organizational labels
        # These typically have empty fields or only placeholder fields
        fields = collection.get('fields', [])
        if not fields or (len(fields) == 1 and fields[0].get('name') == ''):
            continue
            
        # Skip collections that don't have proper folder paths
        # or have generic placeholder folders like just "content/src"
        if not folder or folder == 'content/src':
            continue
        
        # Extract field labels from the fields configuration
        field_labels = {}
        for field in fields:
            field_name = field.get('name', '')
            field_label = field.get('label', field_name)
            if field_name:
                field_labels[field_name] = field_label
        
        if name and folder:
            collections[name] = CollectionConfig(
                name=name,
                label=label,
                folder=folder,
                field_labels=field_labels
            )
    
    return collections


def extract_frontmatter_and_body_from_content(content: str, file_path: Path) -> Tuple[Dict[str, Union[str, int, bool]], str]:
    """
    Extract structured data and body content from file content based on file type.
    
    Args:
        content: The full file content as a string
        file_path: Path object to determine file type from extension
        
    Returns:
        A tuple containing:
        - Dictionary of structured data (frontmatter for .md, full content for .json/.yaml)
        - Body content as a string (markdown body, or empty for structured files)
        
    Raises:
        ValueError: If the content doesn't have valid format
    """
    if not content.strip():
        return {}, ""
    
    file_extension = file_path.suffix.lower()
    
    if file_extension == '.json':
        try:
            json_data = yaml.safe_load(content)  # yaml.safe_load can parse JSON too
            if isinstance(json_data, dict):
                return json_data, ""
            else:
                # If JSON content is not a dict, put it in a special field
                return {"json_content": json_data}, ""
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid JSON content: {e}")
    
    elif file_extension in ['.yaml', '.yml']:
        try:
            yaml_data = yaml.safe_load(content)
            if isinstance(yaml_data, dict):
                return yaml_data, ""
            else:
                # If YAML content is not a dict, put it in a special field
                return {"yaml_content": yaml_data}, ""
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML content: {e}")
    
    elif file_extension == '.md':
        # Handle markdown files with YAML frontmatter
        if not content.startswith('---'):
            return {}, content.strip()
        
        # Find the end of frontmatter
        parts = content.split('---', 2)
        if len(parts) < 3:
            raise ValueError("Invalid frontmatter format: missing closing delimiter")
        
        frontmatter_yaml = parts[1].strip()
        body = parts[2].strip()
        
        try:
            frontmatter_data = yaml.safe_load(frontmatter_yaml) or {}
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML in frontmatter: {e}")
        
        return frontmatter_data, body
    
    else:
        # Unknown file type, treat as plain text
        return {}, content.strip()


def read_content_file(file_path: Path) -> str:
    """
    Read the complete content of a content file from the filesystem.
    
    Args:
        file_path: Path object pointing to the content file
        
    Returns:
        The complete file content as a string
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        UnicodeDecodeError: If the file can't be decoded as UTF-8
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Content file not found: {file_path}")
    except UnicodeDecodeError as e:
        raise UnicodeDecodeError(e.encoding, e.object, e.start, e.end, f"Cannot decode file as UTF-8: {file_path} - {e}")


def parse_single_content_collection_file(file_path: Path) -> ContentData:
    """
    Parse a single content collection file and extract all data.
    
    Args:
        file_path: Path to the content file to parse
        
    Returns:
        ContentData containing structured data, body, and filename
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        ValueError: If the file has invalid format
    """
    content = read_content_file(file_path)
    frontmatter_data, body = extract_frontmatter_and_body_from_content(content, file_path)
    
    return ContentData(
        frontmatter=frontmatter_data,
        body=body,
        filename=file_path.name
    )


def find_all_content_files_in_directory(directory_path: Path) -> List[Path]:
    """
    Find all content files (.md, .json, .yaml, .yml extensions) in the specified directory.
    
    Args:
        directory_path: Path to the directory to search
        
    Returns:
        List of Path objects for all content files found
        
    Raises:
        FileNotFoundError: If the directory doesn't exist
    """
    if not directory_path.exists():
        raise FileNotFoundError(f"Directory not found: {directory_path}")
    
    if not directory_path.is_dir():
        raise NotADirectoryError(f"Path is not a directory: {directory_path}")
    
    content_files = []
    for pattern in ["*.md", "*.json", "*.yaml", "*.yml"]:
        content_files.extend(directory_path.glob(pattern))
    
    return sorted(content_files)  # Sort for consistent ordering


def collect_all_content_collection_data_from_directory(directory_path: Path) -> List[ContentData]:
    """
    Collect data from all content collection files in a directory.
    
    Args:
        directory_path: Path to the directory containing content files
        
    Returns:
        List of ContentData objects, one per content file
        
    Raises:
        FileNotFoundError: If the directory doesn't exist
        ValueError: If any file has invalid format
    """
    content_files = find_all_content_files_in_directory(directory_path)
    
    if not content_files:
        return []
    
    all_data = []
    for file_path in content_files:
        try:
            file_data = parse_single_content_collection_file(file_path)
            all_data.append(file_data)
        except (ValueError, UnicodeDecodeError) as e:
            print(f"Warning: Skipping file {file_path} due to error: {e}")
            continue
    
    return all_data


def determine_all_unique_field_keys_from_content_data(data_list: List[ContentData]) -> List[str]:
    """
    Determine all unique field keys from a list of ContentData objects.
    
    Args:
        data_list: List of ContentData objects containing parsed markdown data
        
    Returns:
        Sorted list of all unique keys found across all frontmatter dictionaries
    """
    if not data_list:
        return ['filename']
    
    all_keys: Set[str] = set()
    for data in data_list:
        all_keys.update(data.frontmatter.keys())
    
    # Always include filename and body
    all_keys.add('filename')
    all_keys.add('body')
    
    # Sort keys, but put common ones first for better readability
    priority_keys = ['filename', 'displayname', 'id', 'webflowId', 'urlSlug', 'webflowName']
    sorted_keys = []
    
    # Add priority keys first if they exist
    for key in priority_keys:
        if key in all_keys:
            sorted_keys.append(key)
            all_keys.remove(key)
    
    # Add remaining keys alphabetically
    sorted_keys.extend(sorted(all_keys))
    
    # Always put 'body' last if it exists
    if 'body' in sorted_keys:
        sorted_keys.remove('body')
        sorted_keys.append('body')
    
    return sorted_keys


def map_field_keys_to_user_friendly_column_headers(
    field_keys: List[str], 
    collection_config: Optional[CollectionConfig]
) -> List[str]:
    """
    Map field keys to user-friendly column headers using collection configuration.
    
    Args:
        field_keys: List of field keys from the parsed data
        collection_config: Collection configuration with field labels, or None
        
    Returns:
        List of user-friendly column headers corresponding to the field keys
    """
    if not collection_config:
        return field_keys
    
    headers = []
    for key in field_keys:
        # Use the label from config if available, otherwise use the key itself
        header = collection_config.field_labels.get(key, key)
        headers.append(header)
    
    return headers


def convert_content_data_to_csv_rows(
    data_list: List[ContentData],
    field_keys: List[str],
    column_headers: List[str]
) -> List[Dict[str, str]]:
    """
    Convert ContentData objects to CSV-compatible row dictionaries.
    
    Args:
        data_list: List of ContentData objects
        field_keys: List of field keys in the same order as column_headers
        column_headers: List of user-friendly column headers for CSV output
        
    Returns:
        List of dictionaries ready for CSV writing with column headers as keys
    """
    csv_rows = []
    
    for data in data_list:
        row = {}
        
        for field_key, column_header in zip(field_keys, column_headers):
            if field_key == 'filename':
                row[column_header] = data.filename
            elif field_key == 'body':
                row[column_header] = data.body
            else:
                # Get value from frontmatter, convert to string
                value = data.frontmatter.get(field_key, '')
                row[column_header] = '' if value is None else str(value)
        
        csv_rows.append(row)
    
    return csv_rows


def write_content_collection_data_to_csv_file(
    csv_rows: List[Dict[str, str]], 
    column_headers: List[str],
    output_file_path: Path
) -> None:
    """
    Write the collected content collection data to a CSV file.
    
    Args:
        csv_rows: List of dictionaries containing the data to write
        column_headers: List of user-friendly column headers for the CSV
        output_file_path: Path where the CSV file should be written
        
    Raises:
        OSError: If there's an error writing to the file
    """
    if not csv_rows:
        # Create empty CSV file with just headers
        with open(output_file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(column_headers or ['filename'])  # At minimum we expect filename
        return
    
    try:
        with open(output_file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=column_headers)
            writer.writeheader()
            
            for row_data in csv_rows:
                writer.writerow(row_data)
                
    except OSError as e:
        raise OSError(f"Error writing CSV file {output_file_path}: {e}")


def parse_content_collection_to_csv(
    source_directory_path: Path, 
    output_csv_path: Path,
    collection_config: Optional[CollectionConfig] = None
) -> None:
    """
    Parse all content collection files and generate a CSV with all data.
    
    This is the main orchestration function that coordinates all the parsing steps:
    1. Find all content files in the source directory (.md, .json, .yaml, .yml)
    2. Parse each file to extract structured data and body
    3. Collect all unique field keys
    4. Map field keys to user-friendly column headers if config is available
    5. Write everything to a CSV file
    
    Args:
        source_directory_path: Path to directory containing content files
        output_csv_path: Path where CSV output should be written
        collection_config: Optional collection configuration for user-friendly field labels
        
    Raises:
        FileNotFoundError: If the source directory doesn't exist
        OSError: If there's an error writing the output file
    """
    print(f"Parsing content files from: {source_directory_path}")
    
    try:
        all_collection_data = collect_all_content_collection_data_from_directory(source_directory_path)
        
        print(f"Found and parsed {len(all_collection_data)} content files")
        
        if all_collection_data:
            field_keys = determine_all_unique_field_keys_from_content_data(all_collection_data)
            column_headers = map_field_keys_to_user_friendly_column_headers(field_keys, collection_config)
            column_count = len(column_headers)
            print(f"Detected {column_count} unique columns across all files")
            
            if collection_config:
                print(f"Using user-friendly column headers from collection '{collection_config.name}'")
        else:
            field_keys = ['filename']
            column_headers = ['filename']
        
        csv_rows = convert_content_data_to_csv_rows(all_collection_data, field_keys, column_headers)
        write_content_collection_data_to_csv_file(csv_rows, column_headers, output_csv_path)
        
        print(f"Successfully wrote CSV output to: {output_csv_path}")
        
    except (FileNotFoundError, OSError, ValueError) as e:
        print(f"Error: {e}")
        raise


def create_argument_parser_for_config_mode(available_collections: Dict[str, CollectionConfig]) -> argparse.ArgumentParser:
    """
    Create argument parser when NetlifyCMS config is available.
    
    Args:
        available_collections: Dictionary of available collections from config
        
    Returns:
        Configured ArgumentParser instance for collection-based mode
    """
    collection_names = list(available_collections.keys())
    
    parser = argparse.ArgumentParser(
        description='Parse content collection files (Markdown, JSON, YAML) and generate CSV output.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Examples:
  # Process all content collections (default)
  %(prog)s
  
  # Process a specific content collection by name
  %(prog)s {collection_names[0] if collection_names else 'collection-name'}
  
  # Process a specific directory by path
  %(prog)s content/src/tasks
  
  # Process with custom output directory
  %(prog)s -o /custom/output/directory
  
  # Process specific collection with custom output
  %(prog)s {collection_names[0] if collection_names else 'collection-name'} -o my-output.csv

Available Collections:
{chr(10).join(f"  {name}: {config.label}" for name, config in available_collections.items())}

When processing all collections, each collection will be exported to a separate CSV file
named after the collection. When processing a single collection or directory, output
defaults to a single CSV file named after the collection/directory.

Field names will be mapped to user-friendly labels from the CMS configuration when available.
        """
    )
    
    parser.add_argument(
        'target',
        nargs='?',
        help='Collection name or directory path to process. If not provided, processes all collections.'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output CSV file path (for single collection) or directory (for all collections). Default: current directory'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='%(prog)s 2.0.0'
    )
    
    return parser


def create_argument_parser_for_path_mode(project_root: Path) -> argparse.ArgumentParser:
    """
    Create argument parser when no NetlifyCMS config is available.
    
    Args:
        project_root: Path to the project root directory
        
    Returns:
        Configured ArgumentParser instance for path-based mode
    """
    default_content_path = project_root / 'content/src/webflow-licenses'
    
    parser = argparse.ArgumentParser(
        description='Parse content collection files (Markdown, JSON, YAML) and generate CSV output.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Parse webflow-licenses directory (default)
  %(prog)s
  
  # Parse a specific directory
  %(prog)s content/src/tasks
  
  # Parse with custom output file
  %(prog)s content/src/tasks -o my-output.csv
  
  # Parse any directory with absolute path
  %(prog)s /path/to/content/files -o /path/to/output.csv

Without NetlifyCMS configuration available, the script operates in path-based mode.
It will parse all content files (.md, .json, .yaml, .yml) in the specified directory, 
extract structured data and body content, and create appropriate CSV columns for all 
discovered fields using the original field names as column headers.
        """
    )
    
    parser.add_argument(
        'path',
        nargs='?',
        default=str(default_content_path),
        help=f'Directory path containing content files (default: {default_content_path})'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output CSV file path (default: ./{folder-name}.csv)'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='%(prog)s 2.0.0'
    )
    
    return parser


def resolve_source_directory_path_from_collection_name(
    collection_name: str,
    available_collections: Dict[str, CollectionConfig],
    project_root: Path
) -> Tuple[Path, CollectionConfig]:
    """
    Resolve source directory path from collection name using config.
    
    Args:
        collection_name: Name of the collection from config
        available_collections: Available collections from NetlifyCMS config
        project_root: Path to the project root directory
        
    Returns:
        Tuple of (resolved_path, collection_config)
        
    Raises:
        ValueError: If collection name is not found in config
        FileNotFoundError: If the resolved directory doesn't exist
    """
    if collection_name not in available_collections:
        raise ValueError(f"Collection '{collection_name}' not found in available collections")
    
    collection_config = available_collections[collection_name]
    
    # Use the folder path from config, resolved relative to project root
    folder_path = collection_config.folder
    path = Path(folder_path)
    
    # If it's already absolute, use as-is, otherwise resolve relative to project root
    if path.is_absolute():
        source_path = path.resolve()
    else:
        source_path = (project_root / path).resolve()
    
    # Check if directory exists
    if not source_path.exists():
        raise FileNotFoundError(f"Directory does not exist: {source_path}")
    
    if not source_path.is_dir():
        raise FileNotFoundError(f"Path exists but is not a directory: {source_path}")
    
    return source_path, collection_config


def resolve_source_directory_path_from_direct_path(directory_path: str, project_root: Path) -> Path:
    """
    Resolve source directory path from direct path specification.
    
    Args:
        directory_path: Direct path to directory containing markdown files
        project_root: Path to the project root directory
        
    Returns:
        Resolved Path object pointing to the directory
    """
    path = Path(directory_path)
    
    # If it's already absolute, use as-is
    if path.is_absolute():
        return path.resolve()
    
    # If it's relative, first try resolving relative to current working directory
    cwd_resolved = Path.cwd() / path
    if cwd_resolved.exists():
        return cwd_resolved.resolve()
    
    # Fall back to resolving relative to project root
    return (project_root / path).resolve()


def resolve_output_file_path_in_current_directory(
    collection_or_path_name: str, 
    output_arg: Optional[str]
) -> Path:
    """
    Resolve the output CSV file path in the current working directory.
    
    Args:
        collection_or_path_name: Collection name or path name for default filename
        output_arg: Output file argument (may be None)
        
    Returns:
        Resolved Path object for the output CSV file in current directory or csv-exports folder
    """
    if output_arg:
        return Path(output_arg).resolve()
    
    # Create default output filename in csv-exports folder in current directory
    basename = Path(collection_or_path_name).name
    output_dir = Path.cwd() / 'csv-exports'
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir / f"{basename}.csv"


def resolve_source_directory_from_target_specification(
    target: str,
    available_collections: Dict[str, CollectionConfig],
    project_root: Path
) -> Tuple[Path, Optional[CollectionConfig]]:
    """
    Resolve source directory and collection config from target specification.
    
    Args:
        target: Either a collection name or a directory path
        available_collections: Available collections from NetlifyCMS config
        project_root: Path to the project root directory
        
    Returns:
        Tuple of (resolved_path, collection_config_or_none)
    """
    # First, try to match as a collection name
    if target in available_collections:
        return resolve_source_directory_path_from_collection_name(target, available_collections, project_root)
    
    # If not a collection name, treat as a directory path
    source_path = resolve_source_directory_path_from_direct_path(target, project_root)
    
    # Try to find a matching collection by comparing folder paths
    matching_collection = None
    for collection_name, collection_config in available_collections.items():
        folder_path = Path(collection_config.folder)
        if folder_path.is_absolute():
            collection_folder_path = folder_path.resolve()
        else:
            collection_folder_path = (project_root / folder_path).resolve()
        
        if collection_folder_path == source_path:
            matching_collection = collection_config
            break
    
    return source_path, matching_collection


def process_all_content_collections_to_csv(
    available_collections: Dict[str, CollectionConfig],
    project_root: Path,
    output_directory: Optional[str] = None
) -> None:
    """
    Process all available content collections and generate CSV files for each.
    
    Args:
        available_collections: Dictionary of available collections from config
        project_root: Path to the project root directory
        output_directory: Optional output directory, defaults to 'csv-exports' in current directory
        
    Raises:
        FileNotFoundError: If any collection directory doesn't exist
        OSError: If there's an error writing any output file
    """
    # Create output directory in current working directory
    if output_directory:
        output_dir = Path(output_directory).resolve()
    else:
        output_dir = Path.cwd() / 'csv-exports'
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Processing all {len(available_collections)} content collections...")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for collection_name, collection_config in available_collections.items():
        try:
            print(f"\n--- Processing collection: {collection_name} ({collection_config.label}) ---")
            
            source_directory, _ = resolve_source_directory_path_from_collection_name(
                collection_name, available_collections, project_root
            )
            
            # Check if there are any content files to process
            all_collection_data = collect_all_content_collection_data_from_directory(source_directory)
        
            if not all_collection_data:
                print(f"Skipping collection '{collection_name}': No content files found")
                skipped_count += 1
                continue
            
            output_file = output_dir / f"{collection_name}.csv"
            parse_content_collection_to_csv(source_directory, output_file, collection_config)
            success_count += 1
            
        except FileNotFoundError as e:
            print(f"Skipping collection '{collection_name}': {e}")
            skipped_count += 1
            continue
        except (OSError, ValueError) as e:
            print(f"Error processing collection '{collection_name}': {e}")
            error_count += 1
            continue
    
    print(f"\n=== Summary ===")
    print(f"Successfully processed: {success_count} collections")
    if skipped_count > 0:
        print(f"Skipped collections: {skipped_count} collections")
    if error_count > 0:
        print(f"Failed to process: {error_count} collections")
    print(f"CSV files saved to: {output_dir}")


def main() -> None:
    """
    Main entry point for the script with command-line argument parsing.
    
    Supports three modes of operation:
    1. Process all collections (when no target specified and config available)
    2. Process specific collection by name or directory by path (when target specified)
    3. Fallback to path-based processing (when no config available)
    
    Uses user-friendly column headers when NetlifyCMS config is available.
    """
    # Determine script location and project root
    script_dir = Path(__file__).parent.resolve()
    project_root = script_dir.parent.parent  # content/scripts -> content -> project_root
    
    # Check for NetlifyCMS config file and load collections
    config_path = project_root / 'web/public/mgmt/config.yml'
    netlifycms_config = load_netlifycms_config_if_exists(config_path)
    available_collections = {}
    
    if netlifycms_config:
        try:
            available_collections = extract_collection_configs_from_netlifycms_config(netlifycms_config)
            print(f"Found {len(available_collections)} collections in {config_path}")
        except Exception as e:
            print(f"Warning: Error parsing config file {config_path}: {e}")
            print("Falling back to path-based mode")
    
    try:
        # Create appropriate argument parser based on config availability
        if available_collections:
            parser = create_argument_parser_for_config_mode(available_collections)
            args = parser.parse_args()
            target = args.target
            output_arg = args.output
            
            # Mode 1: Process all collections (no target specified)
            if not target:
                process_all_content_collections_to_csv(available_collections, project_root, output_arg)
            
            # Mode 2: Process specific target (collection name or directory path)
            else:
                source_directory, collection_config = resolve_source_directory_from_target_specification(
                    target, available_collections, project_root
                )
                output_file = resolve_output_file_path_in_current_directory(target, output_arg)
                
                parse_content_collection_to_csv(source_directory, output_file, collection_config)
                
        else:
            # Mode 3: Path-based mode (no config available)
            parser = create_argument_parser_for_path_mode(project_root)
            args = parser.parse_args()
            directory_path = args.path
            output_arg = args.output
            
            source_directory = resolve_source_directory_path_from_direct_path(directory_path, project_root)
            output_file = resolve_output_file_path_in_current_directory(directory_path, output_arg)
            
            parse_content_collection_to_csv(source_directory, output_file, None)
            
    except (FileNotFoundError, OSError, ValueError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nOperation cancelled by user", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
