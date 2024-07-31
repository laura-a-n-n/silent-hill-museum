import os
import json
import argparse

def get_files_by_extension(directory, extension):
    def recursive_search(directory, extension):
        result = {}
        
        items = os.listdir(directory)
        has_files = any(item.endswith(extension) and os.stat(os.path.join(directory, item)).st_size > 0 for item in items)
        
        if not any(os.path.isdir(os.path.join(directory, item)) for item in items):
            # If the directory contains only files, return a list of files
            return sorted([item for item in items if item.endswith(extension) and os.stat(os.path.join(directory, item)).st_size > 0])
        
        for item in items:
            item_path = os.path.join(directory, item)
            if os.path.isdir(item_path):
                sub_result = recursive_search(item_path, extension)
                if sub_result:
                    result[item] = sub_result

        return result if result else None

    return recursive_search(directory, extension)

def unroll_structure(structure):
    output = []
    
    def recursive_unroll(item):
        if isinstance(item, dict):
            for key in sorted(item.keys()):
                output.append(key)
                recursive_unroll(item[key])
        elif isinstance(item, list):
            output.extend(sorted(item))
    
    recursive_unroll(structure)
    return output

def build_depth_indices(structure):
    output = []
    index = 0
    
    def recursive_unroll(item, depth=0):
        nonlocal index
        if depth >= len(output):
            output.append([])
        if isinstance(item, dict):
            for key in sorted(item.keys()):
                output[depth].append(index)
                index += 1
                recursive_unroll(item[key], depth + 1)
        elif isinstance(item, list):
            output[depth].extend(range(index, index + len(item)))
            index += len(item)
    
    recursive_unroll(structure)
    return output

def get_size_info(structure):
    output = []

    def recursive_unroll(item, depth = 0):
        if depth >= len(output):
            output.append([])
        if isinstance(item, dict):
            keys = item.keys()
            output[depth].append(len(keys))
            for key in sorted(keys):
                recursive_unroll(item[key], depth + 1)
        elif isinstance(item, list):
            output[depth].append(len(item))
    
    recursive_unroll(structure)
    return output

def main():
    parser = argparse.ArgumentParser(
        description='Get JSON information about directory structure.'
    )
    parser.add_argument('path', type=str, help='The directory to search for files.')
    parser.add_argument(
        '-e',
        '--extension',
        type=str,
        default='.mdl',
        help='The file extension to filter by (default: .mdl).'
    )
    parser.add_argument(
        '-u',
        '--unroll', 
        action='store_true',
        help='Unroll the structure into a flat array?'
    )
    parser.add_argument(
        '-d',
        '--depth-info', 
        action='store_true',
        help='Output depth-level index array for flattened structure?'
    )
    parser.add_argument(
        '-s',
        '--size-info', 
        action='store_true',
        help='Output size information?'
    )

    args = parser.parse_args()
    if int(args.depth_info) + int(args.unroll) > 1:
        raise Exception("Please specify only one output mode.")

    result = get_files_by_extension(args.path, args.extension)
    if args.unroll:
        result = unroll_structure(result)
    elif args.depth_info:
        result = build_depth_indices(result)
    elif args.size_info:
        result = get_size_info(result)

    json_result = json.dumps(result, indent=2)
    print(json_result)

if __name__ == '__main__':
    main()