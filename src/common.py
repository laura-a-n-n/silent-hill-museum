import argparse
import os

def validate_path(path, validation_extension=None):
    # Check if file or folder exists
    if os.path.isdir(path):
        return True
    if not os.path.isfile(path):
        raise argparse.ArgumentTypeError(
            f"{path} does not exist or is not a valid file.")

    # Check file extension
    if validation_extension is not None and not path.lower().endswith(validation_extension):
        raise argparse.ArgumentTypeError(
            f"{path} should have a ${validation_extension} extension.")
    return True

def validate_and_exec(parser, handle_file, validation_extension=None):
    args = parser.parse_args()

    # Validate arguments
    try:
        validate_path(args.path, validation_extension)
    except argparse.ArgumentTypeError as e:
        parser.error(e)

    # Check if the path is a directory
    if os.path.isdir(args.path):
        total_files = 0
        valid_files = 0
        successes = 0
        failures = []
        # Iterate over all items in the directory
        for item in os.listdir(args.path):
            total_files += 1
            item_path = os.path.join(args.path, item)
            is_valid = False
            try:
                if os.path.isfile(item_path) and validate_path(item_path):
                    valid_files += 1
                    is_valid = True
                    if handle_file(item_path, args):
                        successes += 1
            except Exception as e:
                print(f"An error occurred: {e}")
                if is_valid:
                    failures.append(item_path)
                pass
        
        if len(failures) > 0:
            print("The following files failed:", failures)
        else:
            print("Every file succeeded!")
        print(f"Successfully generated assets for {successes}/{valid_files} files! ({total_files} files examined)")
    else:
        handle_file(args.path, args)