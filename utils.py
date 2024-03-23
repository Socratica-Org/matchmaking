def chunk_array(arr, chunk_size):
    # Use list comprehension to create subarrays of size 'chunk_size'
    return [arr[i:i + chunk_size] for i in range(0, len(arr), chunk_size)]
