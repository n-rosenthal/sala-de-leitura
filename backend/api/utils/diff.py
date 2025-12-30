"""
    `backend/api/utils/diff.py`, utilitários
"""

def generate_diff(instance, validated_data, fields):
    """
    Gera um dicionário com as diferenças entre o objeto antes
    da validação e o dicionário de dados validados.
    
    Parameters:
    instance (Model): O objeto antes da validação.
    validated_data (dict): O dicionário de dados validados.
    fields (list of str): A lista de campos a serem comparados.
    
    Returns:
    dict: Um dicionário com as diferenças entre o objeto antes
    da validação e o dicionário de dados validados.
    """
    diff = {}

    for field in fields:
        before = getattr(instance, field, None)
        after = validated_data.get(field, before)

        if before != after:
            diff[field] = {
                "before": before,
                "after": after
            }

    return diff
