import os
import json
import argparse

def get_files_by_extension(directory, extension):
    files_map = {}
    
    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        
        if os.path.isdir(item_path):
            # Initialize a list to hold the files with the specified extension
            files_with_extension = []
            
            # Iterate through the files in the sub-directory
            for file in os.listdir(item_path):
                if file.endswith(extension) and os.stat(os.path.join(item_path, file)).st_size > 0:
                    files_with_extension.append(file)
            
            # Add the entry to the map
            files_map[item] = sorted(files_with_extension)
    
    return files_map

def main():
    parser = argparse.ArgumentParser(
        description='Get a JSON object listing directory structure.'
    )
    parser.add_argument('path', type=str, help='The directory to search for files.')
    parser.add_argument(
        '-e',
        '--extension',
        type=str,
        default='.mdl',
        help='The file extension to filter by (default: .mdl).'
    )

    args = parser.parse_args()
    result = get_files_by_extension(args.path, args.extension)

    json_result = json.dumps(result, indent=2)
    print(json_result)

if __name__ == '__main__':
    main()